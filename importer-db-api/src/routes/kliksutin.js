const express = require('express')
const { Op } = require('sequelize')
const { addMonths } = require('date-fns')
const models = require('../models/index.js')

const router = express.Router()

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
  'urn:code:course-unit-realisation-type:teaching-participation-seminar',
  'urn:code:course-unit-realisation-type:independent-work-project',
]

const relevantAttributes = {
  courseUnit: [
    'id',
    'code',
    'responsibilityInfos',
    'completionMethods',
    'name',
    'validityPeriod',
  ],
  courseUnitRealisation: [
    'id',
    'name',
    'nameSpecifier',
    'assessmentItemIds',
    'activityPeriod',
    'courseUnitRealisationTypeUrn',
    'responsibilityInfos',
  ],
  assessmentItem: ['id', 'name', 'nameSpecifier', 'assessmentItemType', 'organisations', 'primaryCourseUnitGroupId'],
}

const timeTillCourseStart = 6

const addCourseUnitsToRealisations = async courseUnitRealisations => {
  const assessmentItemIds = courseUnitRealisations.flatMap(c => c.assessmentItemIds)

  const assessmentItemsWithCrap = await models.AssessmentItem.findAll({
    attributes: relevantAttributes.assessmentItem,
    where: {
      id: {
        [Op.in]: assessmentItemIds,
      },
    },
    include: [
      {
        model: models.CourseUnit,
        attributes: relevantAttributes.courseUnit,
        as: 'courseUnit',
        required: true,
      }
    ],
  })

  const assessmentItems = assessmentItemsWithCrap.filter(aItem => (aItem?.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))))

  const realisationsWithCourseUnits = courseUnitRealisations.map((r) => {
    const realisation = r.get({ plain: true })
  
    const courseUnits = assessmentItems
      .filter(assessmentItem =>
        realisation.assessmentItemIds.includes(assessmentItem.id)
      )
      .map(assessmentItem => {
        const courseUnit = assessmentItem.get({ plain: true }).courseUnit
        return courseUnit
      })
  
    return {
      ...realisation,
      courseUnits,
    }
  })

  return realisationsWithCourseUnits
}


router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    where: {
      responsibilityInfos: {
        [Op.contains]: [{ personId: teacherId }], // note that '{ personId: teacherId }' would not work. In pg, array containment is more like checking for union
      },
      activityPeriod: {
        endDate: {
          [Op.gt]: new Date(),
        },
        startDate: {
          [Op.lt]: addMonths(new Date(), timeTillCourseStart),
        },
      },
      courseUnitRealisationTypeUrn: {
        [Op.in]: validRealisationTypes
      }
    },
  })

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits)
})

module.exports = router
