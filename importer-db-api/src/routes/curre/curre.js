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

router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const courseStartTreshold = addMonths(new Date(), timeTillCourseStart)

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    where: {
      responsibilityInfos: {
        [Op.contains]: [{ personId: teacherId }],
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

curreRouter.get('/enrolments-new', async (req, res) => {
  const { since: sinceRaw } = req.query

  const since = new Date(sinceRaw)

  if (!sinceRaw || since == 'Invalid Date') {
    return res.status(400).send({ message: 'Missing or invalid query parameter since' })
  }

  const enrolments = await models.Enrolment.findAll({
    where: {
      state: 'ENROLLED',
      enrolmentDateTime: {
        [Op.gte]: since,
      },
    },
    attributes: relevantAttributes.enrolments,
    order: [['id', 'DESC']],
  })

  res.send(enrolments)
})

router.use('/updater', curreRouter)

module.exports = router