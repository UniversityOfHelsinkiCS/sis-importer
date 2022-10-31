const { Op, QueryTypes } = require('sequelize')
const express = require('express')
const models = require('../../models')
const { sequelize } = require('../../config/db')
const { relevantAttributes, validRealisationTypes } = require('./config')
const { refreshPersonStudyRightsView } = require('./personStudyRightsView')
const _ = require('lodash')

const attributesToSql = (table, attributes) => {
  return attributes.map(attribute => `${table}.${_.snakeCase(attribute)} "${attribute}"`).join(', ')
}

const getCourseRealisationsWithCourseUnits = async (limit, offset) => {
  const sql = `
    SELECT 
      ${attributesToSql('cur', relevantAttributes.courseUnitRealisation)},
      json_agg(ass) as "assessmentItems"
    FROM course_unit_realisations cur
    INNER JOIN assessment_items ass ON ass.id = ANY (cur.assessment_item_ids)
    WHERE cur.course_unit_realisation_type_urn IN (:validRealisationTypes)
    GROUP BY cur.id
    LIMIT :limit OFFSET :offset
  `

  return await sequelize.query(sql, {
    replacements: { limit, offset, validRealisationTypes },
    queryType: QueryTypes.SELECT,
  })
}

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
  const assessmentItems = assessmentItemsWithCrap.filter(aItem => {
    if (!aItem.courseUnit) return false
    if (aItem.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))) return true

    return false
  })

  const realisationsWithCourseUnits = []
  for (const r of courseUnitRealisations) {
    const realisation = r.get({ plain: true })

    const courseUnits = []
    for (const assessmentItem of assessmentItems) {
      if (!realisation.assessmentItemIds.includes(assessmentItem.id)) continue
      const courseUnit = assessmentItem.get({ plain: true }).courseUnit
      delete courseUnit.completionMethods
      courseUnits.push(courseUnit)
    }

    realisation.courseUnits = courseUnits

    realisationsWithCourseUnits.push(realisation)
  }

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

  await refreshPersonStudyRightsView()

  const personsWithStudyRight = await sequelize.query(
    `SELECT P.id, P.student_number, P.employee_number, P.edu_person_principal_name,
      P.first_names, P.last_name, P.call_name, P.primary_email, P.secondary_email, P.preferred_language_urn, psr.has_study_right
      FROM persons P
      LEFT JOIN person_study_rights_view psr ON psr.person_id = P.id
      ORDER BY P.id DESC 
      LIMIT :limit OFFSET :offset`,
    {
      replacements: {
        limit,
        offset,
      },
      mapToModel: true,
      model: models.Person,
    }
  )

  res.send(personsWithStudyRight)
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

updaterRouter.get('/enrolments/:courseRealisationId', async (req, res) => {
  const id = req.params?.courseRealisationId
  if (!id) return res.sendStatus(400)

  const enrolments = await models.Enrolment.findAll({
    where: {
      state: 'ENROLLED',
      courseUnitRealisationId: id,
    },
    attributes: relevantAttributes.enrolment,
    order: [['id', 'DESC']],
  })

  if (!enrolments?.length > 0) {
    return res.status(404).send({ message: 'Course unit realisation not found or has no enrolments' })
  }

  res.send(enrolments)
})

updaterRouter.get('/enrolments-new', async (req, res) => {
  const { since: sinceRaw } = req.query
  const since = new Date(sinceRaw)
  if (!sinceRaw || since == 'Invalid Date') {
    return res.status(400).send({ message: 'Missing or invalid query parameter since' })
  }
  const enrolments = await models.Enrolment.findAll({
    where: {
      state: 'ENROLLED',
      createdAt: {
        [Op.gte]: since,
      },
    },
    attributes: relevantAttributes.enrolment,
    order: [['id', 'DESC']],
  })

  res.send(enrolments)
})

router.use('/updater', updaterRouter)

module.exports = router
