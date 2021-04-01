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

router.get('/course_unit_realisations/responsible/:username', async (req, res) => {
  const {
    params: { username },
  } = req

  const sisuPerson = await models.Person.findOne({ where: { eduPersonPrincipalName: getEduPersonPrincipalNameFromUsername(username) }})

  const [courseUnitRealisations] = await models.CourseUnitRealisation.sequelize.query(`select * from course_unit_realisations where array_to_json(responsibility_infos)::jsonb @> '[{"personId": "${sisuPerson.id}"}]'`);

  res.send(courseUnitRealisations)
})

module.exports = router
