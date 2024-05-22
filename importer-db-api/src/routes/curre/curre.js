const { Op } = require('sequelize')
const express = require('express')
const models = require('../../models')

const { addMonths } = require('date-fns')
const { timeTillCourseStart, relevantAttributes, validRealisationTypes } = require('./config')

const router = express.Router()

const curreRouter = express.Router()

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

  const assessmentItems = assessmentItemsWithCrap.filter(aItem =>
    aItem?.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))
  )

  const realisationsWithCourseUnits = courseUnitRealisations.map(aRealisation => {
    const realisation = aRealisation.get({ plain: true })

    const courseUnits = assessmentItems
      .filter(assessmentItem => realisation.assessmentItemIds.includes(assessmentItem.id))
      .map(assessmentItem => {
        const courseUnit = assessmentItem.get({ plain: true }).courseUnit
        delete courseUnit.completionMethods
        return courseUnit
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
      ],
      courseUnitRealisationTypeUrn: {
        [Op.in]: validRealisationTypes
      }
    }
  })

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits)
})

curreRouter.get('/enrolments-new', async (req, res) => {
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

curreRouter.get('/persons', async (req, res) => {
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

router.use('/', curreRouter)

module.exports = router
