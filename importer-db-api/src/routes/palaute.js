const { Op } = require('sequelize')
const express = require('express')
const models = require('../models')

const relevantAttributes = {
  enrolment: ['id', 'personId', 'assessmentItemId', 'courseUnitRealisationId', 'courseUnitId', 'studySubGroups'],
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
    'assessmentItemIds',
    'activityPeriod',
    'courseUnitRealisationTypeUrn',
    'studyGroupSets',
    'organisations',
    'responsibilityInfos',
  ],
  assessmentItem: ['id', 'name', 'nameSpecifier', 'assessmentItemType', 'organisations', 'primaryCourseUnitGroupId'],
  person: ['id', 'studentNumber', 'employeeNumber', 'eduPersonPrincipalName', 'firstNames', 'lastName'],
  organisation: ['id', 'code', 'name', 'parentId'],
}

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
  'urn:code:course-unit-realisation-type:teaching-participation-seminar',
]

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
    if (!aItem.courseUnit) return false
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
    query: { startDateBefore, startDateAfter, endDateBefore, endDateAfter },
  } = req

  const scopes = [
    startDateBefore && { method: ['activityPeriodStartDateBefore', new Date(startDateBefore)] },
    startDateAfter && { method: ['activityPeriodStartDateAfter', new Date(startDateAfter)] },
    endDateBefore && { method: ['activityPeriodEndDateBefore', new Date(endDateBefore)] },
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

router.get('/organisations', async (req, res) => {
  const organisations = await models.Organisation.findAll({
    attributes: relevantAttributes.organisation,
  })

  res.send(organisations)
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

const updaterRouter = express.Router()

updaterRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const persons = await models.Person.findAll({
    attributes: relevantAttributes.person,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  res.send(persons)
})

updaterRouter.get('/organisations', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const organisations = await models.Organisation.findAll({
    attributes: relevantAttributes.organisation,
    where: {
      [Op.and]: [
        // Only latest snapshot
        models.Organisation.sequelize.literal(
          '(id, snapshot_date_time) in (select id, max(snapshot_date_time) from organisations group by id)'
        ),
      ],
    },
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  res.send(organisations)
})

updaterRouter.get('/course_unit_realisations_with_course_units', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    where: {
      courseUnitRealisationTypeUrn: {
        [Op.in]: validRealisationTypes,
      },
    },
    attributes: relevantAttributes.courseUnitRealisation,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits)
})

updaterRouter.get('/enrolments', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const enrolments = await models.Enrolment.findAll({
    where: {
      state: 'ENROLLED',
    },
    attributes: relevantAttributes.enrolment,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  res.send(enrolments)
})

router.use('/updater', updaterRouter)

module.exports = router
