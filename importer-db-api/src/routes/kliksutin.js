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
    'groupId',
    'code',
    'organisations',
    'completionMethods',
    'responsibilityInfos',
    'name',
    'validityPeriod',
  ],
  courseUnitRealisation: [
    'id',
    'name',
    'nameSpecifier',
    'activityPeriod',
    'courseUnitRealisationTypeUrn',
    'responsibilityInfos',
  ],
}


router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const timeTillCourseStart = 6

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

  const courseUnits = await models.CourseUnit.findAll({
    where: {
      responsibilityInfos: {
        [Op.contains]: [{ personId: teacherId }], // note that '{ personId: teacherId }' would not work. In pg, array containment is more like checking for union
      },
      validityPeriod: {
        endDate: {
          [Op.gt]: new Date(),
        },
        startDate: {
          [Op.lt]: addMonths(new Date(), timeTillCourseStart),
        },
      },
    },
  })

  res.send(courseUnitRealisations)
})

module.exports = router
