const express = require('express')
const _ = require('lodash')

const models = require('../models')

const router = express.Router()

const getEduPersonPrincipalNameFromUsername = username => `${username}@helsinki.fi`

router.get('/course_unit_realisations/by_enrolments/:username', async (req, res) => {
  const {
    params: { username },
    query: { startDateAfter, endDateBefore },
  } = req

  const scopes = [
    startDateAfter && { method: ['activityPeriodStartDateAfter', new Date(startDateAfter)] },
    endDateBefore && { method: ['activityPeriodEndDateBefore', new Date(endDateBefore)] },
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
