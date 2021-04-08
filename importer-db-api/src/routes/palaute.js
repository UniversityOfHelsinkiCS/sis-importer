const { Op } = require('sequelize')
const express = require('express')
const models = require('../models')

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
    include: [{ model: models.CourseUnitRealisation.scope(scopes) }, { model: models.AssessmentItem }],
  })

  res.send(enrolments)
})

router.get('/responsible/:personId', async (req, res) => {
  const {
    params: { personId },
  } = req

  const courses = await models.CourseUnitRealisation.findAll({
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

  const assessmentItemIds = [].concat(...courses.map(c => c.assessmentItemIds))

  const assessmentItems = await models.AssessmentItem.findAll({
    where: {
      id: {
        [Op.in]: assessmentItemIds,
      },
    },
  })

  const withAssessmentItems = courses.map(course => {
    return {
      ...course.dataValues,
      assessmentItems: course.assessmentItemIds.map(id => assessmentItems.find(aItem => aItem.id === id)),
    }
  })

  res.send(withAssessmentItems)
})

module.exports = router
