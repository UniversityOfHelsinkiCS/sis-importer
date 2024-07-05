const { Op } = require('sequelize')
const express = require('express')
const models = require('../../models')
const { sequelize } = require('../../config/db')
const { relevantAttributes, validRealisationTypes } = require('./config')
const { isRefreshingPersonStudyRightsView } = require('./personStudyRightsView')

const defaultSince = new Date('2021-01-01')

const addCourseUnitsToRealisations = async courseUnitRealisations => {
  const assessmentItemIds = courseUnitRealisations.flatMap(c => c.assessmentItemIds)
  const assessmentItemsWithCrap = await models.AssessmentItem.findAll({
    attributes: relevantAttributes.assessmentItem,
    where: {
      id: {
        [Op.in]: assessmentItemIds
      }
    },
    include: [
      {
        model: models.CourseUnit,
        attributes: relevantAttributes.courseUnit,
        as: 'courseUnit',
        required: true
      }
    ]
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

const updaterRouter = express.Router()

updaterRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  if (isRefreshingPersonStudyRightsView()) {
    return res.send({
      waitAndRetry: true,
      message: 'Person study rights view is being refreshed',
      waitTime: 10_000
    })
  }

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
        offset
      },
      mapToModel: true,
      model: models.Person
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
          '(code, snapshot_date_time) in (select code, max(snapshot_date_time) from organisations group by code)'
        )
      ]
    },
    limit,
    offset,
    order: [['id', 'DESC']]
  })

  res.send(organisations)
})

updaterRouter.get('/course_unit_realisations_with_course_units', async (req, res) => {
  const { limit, offset, since: sinceRaw } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  let since = new Date(sinceRaw)
  if (!sinceRaw || since === 'Invalid Date') {
    since = defaultSince
  }

  const courseUnitRealisations = await models.CourseUnitRealisation.scope({
    method: ['activityPeriodEndDateAfter', since]
  }).findAll({
    where: {
      courseUnitRealisationTypeUrn: {
        [Op.in]: validRealisationTypes
      }
    },
    attributes: relevantAttributes.courseUnitRealisation,
    limit,
    offset,
    order: [['id', 'DESC']]
  })

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits)
})

updaterRouter.get('/course_unit_realisation_with_course_unit/:id', async (req, res) => {
  const { id } = req.params

  if (!id) return res.sendStatus(400)

  const courseUnitRealisation = await models.CourseUnitRealisation.findByPk(id, {
    attributes: relevantAttributes.courseUnitRealisation
  })

  if (!courseUnitRealisation) return res.sendStatus(404)

  const [courseUnitRealisationWithCourseUnits] = await addCourseUnitsToRealisations([courseUnitRealisation])

  res.send(courseUnitRealisationWithCourseUnits)
})

/**
 * Gets all enrolments that might need to be deleted from palaute.
 */
updaterRouter.get('/deleted-enrolments', async (req, res) => {
  const { limit, offset, since: sinceRaw } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  let since = new Date(sinceRaw)
  if (!sinceRaw || since === 'Invalid Date') {
    since = defaultSince
  }

  const enrolments = await models.Enrolment.unscoped().findAll({
    where: {
      enrolmentDateTime: {
        [Op.gte]: since
      },
      [Op.or]: [
        {
          [Op.not]: {
            state: 'ENROLLED'
          }
        },
        {
          documentState: 'DELETED'
        }
      ]
    },
    attributes: relevantAttributes.enrolment,
    limit,
    offset,
    order: [['id', 'DESC']]
  })

  res.send(enrolments)
})

/**
 * Gets all enrolments that should exist in palaute.
 */
updaterRouter.get('/enrolments', async (req, res) => {
  const { limit, offset, since: sinceRaw } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  let since = new Date(sinceRaw)
  if (!sinceRaw || since === 'Invalid Date') {
    since = defaultSince
  }

  const enrolments = await models.Enrolment.findAll({
    where: {
      enrolmentDateTime: {
        [Op.gte]: since
      },
      state: 'ENROLLED'
    },
    attributes: relevantAttributes.enrolment,
    limit,
    offset,
    order: [['id', 'DESC']]
  })

  res.send(enrolments)
})

updaterRouter.get('/enrolments/:courseRealisationId', async (req, res) => {
  const id = req.params?.courseRealisationId
  if (!id) return res.sendStatus(400)

  const enrolments = await models.Enrolment.findAll({
    where: {
      state: 'ENROLLED',
      courseUnitRealisationId: id
    },
    attributes: relevantAttributes.enrolment,
    order: [['id', 'DESC']]
  })

  if (!enrolments?.length > 0) {
    return res.status(404).send({ message: 'Course unit realisation not found or has no enrolments' })
  }

  res.send(enrolments)
})

updaterRouter.get('/enrolments-new', async (req, res) => {
  const { since: sinceRaw } = req.query
  const since = new Date(sinceRaw)
  if (!sinceRaw || since === 'Invalid Date') {
    return res.status(400).send({ message: 'Missing or invalid query parameter since' })
  }
  const enrolments = await models.Enrolment.findAll({
    where: {
      state: 'ENROLLED',
      enrolmentDateTime: {
        [Op.gte]: since
      }
    },
    attributes: relevantAttributes.enrolment,
    order: [['id', 'DESC']]
  })

  res.send(enrolments)
})

router.use('/updater', updaterRouter)

module.exports = router
