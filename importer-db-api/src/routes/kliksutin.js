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
  courseUnit: ['id', 'code', 'responsibilityInfos', 'completionMethods', 'name', 'validityPeriod'],
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

const teacherUrns = [
  'urn:code:course-unit-realisation-responsibility-info-type:teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:responsible-teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:administrative-person',
]

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
      },
    ],
  })

  const assessmentItems = assessmentItemsWithCrap.filter(aItem =>
    aItem?.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))
  )

  const realisationsWithCourseUnits = courseUnitRealisations.map(r => {
    const realisation = r.get({ plain: true })

    const courseUnits = assessmentItems
      .filter(assessmentItem => realisation.assessmentItemIds.includes(assessmentItem.id))
      .map(assessmentItem => {
        const courseUnit = assessmentItem.get({ plain: true }).courseUnit
        delete courseUnit.completionMethods
        return courseUnit
      })

    return {
      ...realisation,
      courseUnits,
    }
  })

  return realisationsWithCourseUnits
}

router.get('/course/:courseId', async (req, res) => {
  const { courseId } = req.params

  const courseUnitRealisations = await models.CourseUnitRealisation.findOne({
    attributes: relevantAttributes.courseUnitRealisation,
    where: {
      id: courseId,
      courseUnitRealisationTypeUrn: {
        [Op.in]: validRealisationTypes,
      },
    },
  })

  res.send(courseUnitRealisations)
})

router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const courseStartTreshold = addMonths(new Date(), timeTillCourseStart)

  console.log(courseStartTreshold)

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    where: {
      responsibilityInfos: {
        [Op.contains]: [{ personId: teacherId }], // note that '{ personId: teacherId }' would not work. In pg, array containment is more like checking for union
      },
      [Op.and]: [
        {
          'activityPeriod.endDate': {
            [Op.gte]: new Date(),
          },
        },
        {
          'activityPeriod.startDate': {
            [Op.lte]: courseStartTreshold,
          },
        },
      ],
      courseUnitRealisationTypeUrn: {
        [Op.in]: validRealisationTypes,
      },
    },
  })

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits)
})

router.get('/enrollments/:personId', async (req, res) => {
  const { personId: studentId } = req.params

  const enrollments = await models.Enrolment.findAll({
    where: {
      personId: studentId,
    },
    include: [
      { model: models.CourseUnit, as: 'courseUnit' },
      { model: models.CourseUnitRealisation, as: 'courseUnitRealisation' },
    ],
    raw: true,
    nest: true,
  })

  return res.send(enrollments)
})

router.get('/teachers/:courseId', async (req, res) => {
  const { courseId } = req.params

  const { responsibilityInfos } = await models.CourseUnitRealisation.findOne({
    where: {
      id: courseId,
    },
    attributes: ['responsibilityInfos'],
  })

  const teacherIds = responsibilityInfos
    .filter(({ roleUrn }) => teacherUrns.includes(roleUrn))
    .map(({ personId }) => personId)

  res.send(teacherIds)
})

module.exports = router
