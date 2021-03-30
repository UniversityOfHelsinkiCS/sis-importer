const express = require('express')
const _ = require('lodash')

const models = require('../models')

const router = express.Router()

const getEduPersonPrincipalNameFromUsername = username => `${username}@helsinki.fi`

router.get('/course_unit_realisations/enrolled/:username', async (req, res) => {
  const {
    params: { username },
    query: { startDateBefore, endDateAfter },
  } = req

  const scopes = [
    startDateBefore && { method: ['activityPeriodStartDateBefore', new Date(startDateBefore)] },
    endDateAfter && { method: ['activityPeriodEndDateAfter', new Date(endDateAfter)] },
  ].filter(Boolean)

  const enrolments = await models.Enrolment.findAll({
    include: [
      { model: models.CourseUnitRealisation.scope(scopes) },
      { model: models.Person, where: { eduPersonPrincipalName: getEduPersonPrincipalNameFromUsername(username) } },
    ],
  })

  const courseUnitRealisations = enrolments.map(({ course_unit_realisation }) => course_unit_realisation)

  res.send(courseUnitRealisations)
})

module.exports = router
