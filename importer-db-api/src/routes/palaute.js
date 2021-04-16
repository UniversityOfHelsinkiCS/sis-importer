const { Op } = require('sequelize')
const express = require('express')
const models = require('../models')

const relevantAttributes = {
  enrolment: ['id', 'personId', 'assessmentItemId', 'courseUnitRealisationId', 'courseUnitId', 'studySubGroups'],
  courseUnit: ['id', 'groupId', 'code', 'organisations', 'completionMethods', 'responsibilityInfos', 'name'],
  courseUnitRealisation: [
    'id',
    'name',
    'nameSpecifier',
    'assessmentItemIds',
    'activityPeriod',
    'courseUnitRealisationTypeUrn',
    'studyGroupSets',
    'organisations',
    'responsibilityInfos',
  ],
  assessmentItem: ['id', 'name', 'nameSpecifier', 'assessmentItemType', 'organisations', 'primaryCourseUnitGroupId'],
  person: ['id', 'studentNumber', 'eduPersonPrincipalName', 'firstNames', 'lastName'],
}

const addCourseUnitsToRealisations = async courseUnitRealisations => {
  const assessmentItemIds = [].concat(...courseUnitRealisations.map(c => c.assessmentItemIds))

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
      },
    ],
  })

  const assessmentItems = assessmentItemsWithCrap.filter(aItem => {
    if (aItem.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))) return true

    return false
  })

  const realisationsWithCourseUnits = courseUnitRealisations.map(r => {
    const realisation = r.get({ plain: true })
    return {
      ...realisation,
      courseUnits: [].concat(
        ...realisation.assessmentItemIds.map(aId =>
          assessmentItems
            .filter(aItem => aItem.id === aId)
            .map(aItem => {
              const courseUnit = aItem.get({ plain: true }).courseUnit
              delete courseUnit.completionMethods
              return courseUnit
            })
        )
      ),
    }
  })

  return realisationsWithCourseUnits
}

const router = express.Router()

router.get('/enrolled/:personId', async (req, res) => {
  const {
    params: { personId },
    query: { startDateBefore, endDateAfter },
  } = req

  const scopes = [
    startDateBefore && { method: ['activityPeriodStartDateBefore', new Date(startDateBefore)] },
    endDateAfter && { method: ['activityPeriodEndDateAfter', new Date(endDateAfter)] },
  ].filter(Boolean)

  const enrolments = await models.Enrolment.findAll({
    where: {
      personId,
    },
    attributes: relevantAttributes.enrolment,
    include: [
      {
        model: models.CourseUnitRealisation.scope(scopes),
        attributes: relevantAttributes.courseUnitRealisation,
        as: 'courseUnitRealisation',
      },
      {
        model: models.CourseUnit,
        attributes: relevantAttributes.courseUnit,
        as: 'courseUnit',
      },
    ],
  })

  res.send(enrolments)
})

router.get('/responsible/:personId', async (req, res) => {
  const {
    params: { personId },
  } = req

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    where: {
      responsibilityInfos: {
        [Op.contains]: [
          {
            personId: personId,
          },
        ],
      },
    },
  })

  const courseUnits = await models.CourseUnit.findAll({
    attributes: relevantAttributes.courseUnit,
    where: {
      responsibilityInfos: {
        [Op.contains]: [
          {
            personId: personId,
          },
        ],
      },
    },
  })

  const realisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send({
    courseUnitRealisations: realisationsWithCourseUnits,
    courseUnits,
  })
})

router.get('/persons', async (req, res) => {
  const where = {}

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === 'token') return

    where[key] = { [Op.iLike]: `%${value}%` }
  })

  const persons = await models.Person.findAll({
    attributes: relevantAttributes.person,
    limit: 100,
    where,
  })

  res.send({
    persons,
  })
})

const programmeRouter = express.Router()

const findProgramme = async (req, res, next) => {
  const {
    params: { programmeCode }, // '500-K005' = CS kandi
  } = req

  if (!programmeCode) return res.status(500).send('Missing programmeCode')

  const organisation = await models.Organisation.findOne({
    where: {
      code: programmeCode,
    },
  })

  if (!organisation) return res.status(404).send('No such organization, use different code e.g. 500-K005')

  req.organisation = organisation

  next()
}

programmeRouter.get('/course_unit_realisations', async (req, res) => {
  const courseUnitRealisations = await req.organisation.getCourseUnitRealisations()

  const withUnits = await addCourseUnitsToRealisations(courseUnitRealisations)
  res.send(withUnits)
})

programmeRouter.get('/course_units', async (req, res) => {
  const courseUnits = await req.organisation.getCourseUnits()

  res.send(courseUnits)
})

programmeRouter.get('/recursively/course_unit_realisations', async (req, res) => {
  const { limit, offset } = req.query
  const courseUnitRealisations = await req.organisation.getCourseUnitRealisationsRecursively(limit, offset)

  const withUnits = await addCourseUnitsToRealisations(courseUnitRealisations)
  res.send(withUnits)
})

router.use('/programme/:programmeCode', findProgramme, programmeRouter)

module.exports = router
