const { Op } = require('sequelize')
const express = require('express')
const models = require('../../models')

const { addMonths } = require('date-fns')
const { timeTillCourseStart, relevantAttributes } = require('./config')

const router = express.Router()

const apparaattiRouter = express.Router()

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

  const allOrganisationIds = assessmentItemsWithCrap.flatMap(assessmentItem =>
    assessmentItem.organisations.map(org => org.organisationId)
  )

  const allOrganisations = await models.Organisation.findAll({
    attributes: ['name', 'id', 'code'],
    where: {
      id: allOrganisationIds
    }
  })

  const assessmentItems = assessmentItemsWithCrap.filter(aItem =>
    aItem?.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))
  )

  const findOrgByAssessmentItem = assessmentItem =>
    assessmentItem.organisations.map(org =>
      allOrganisations.find(organisation => organisation.id === org.organisationId)
    )

  const realisationsWithCourseUnits = courseUnitRealisations.map(aRealisation => {
    const realisation = aRealisation.get({ plain: true })

    const courseUnits = assessmentItems
      .filter(assessmentItem => realisation.assessmentItemIds.includes(assessmentItem.id))
      .map(assessmentItem => {
        const courseUnit = assessmentItem.get({ plain: true }).courseUnit
        const organisations = findOrgByAssessmentItem(assessmentItem)
        delete courseUnit.completionMethods
        return { ...courseUnit, organisations }
      })

    return {
      ...realisation,
      courseUnits
    }
  })

  return realisationsWithCourseUnits
}

router.get('/courses', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const courseStartTreshold = addMonths(new Date(), timeTillCourseStart)

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    limit,
    offset,
    where: {
      [Op.and]: [
        {
          'activityPeriod.endDate': {
            [Op.gte]: new Date()
          }
        },
        {
          'activityPeriod.startDate': {
            [Op.lte]: courseStartTreshold
          }
        }
      ]
    }
  })

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits)
})

apparaattiRouter.get('/enrolments-new', async (req, res) => {
  const { since: sinceRaw, limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const since = new Date(sinceRaw)

  if (!sinceRaw || since === 'Invalid Date') {
    return res.status(400).send({ message: 'Missing or invalid query parameter since' })
  }

  const enrolments = await models.Enrolment.findAll({
    limit,
    offset,
    where: {
      state: 'ENROLLED',
      enrolmentDateTime: {
        [Op.gte]: since
      }
    },
    attributes: relevantAttributes.enrolments,
    order: [['id', 'DESC']]
  })

  res.send(enrolments)
})

apparaattiRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const persons = await models.Person.findAll({
    attributes: relevantAttributes.persons,
    order: [['id', 'DESC']],
    limit,
    offset
  })

  res.send(persons)
})

router.use('/', apparaattiRouter)

module.exports = router
