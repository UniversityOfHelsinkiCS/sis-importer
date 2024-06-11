const express = require('express')
const { relevantAttributes } = require('./config')
const models = require('../../models')
const { sequelize } = require('../../config/db')

const router = express.Router()

const grapaRouter = express.Router()

grapaRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const personsWithStudyRightOrEmployeeNumber = await sequelize.query(
    `SELECT ${relevantAttributes.persons.map(attr => `P.${attr}`)}
      FROM persons P
      LEFT JOIN person_study_rights_view psr ON psr.person_id = P.id
      WHERE has_study_right IS TRUE OR employee_number IS NOT NULL
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

  res.send(personsWithStudyRightOrEmployeeNumber)
})

grapaRouter.get('/studytracks/:code', async (req, res) => {
  const programmes = await models.Module.findAll({
    where: {
      code: req.params.code
    }
  }).filter(p => !p.validityPeriod.endDate)

  const [studytracks] = await sequelize.query(
    `
      SELECT distinct m.name
      FROM "modules" m
      JOIN "studyrights" s ON m."group_id" = s.accepted_selection_path->>'educationPhase2ChildGroupId'
      WHERE s.accepted_selection_path->>'educationPhase2GroupId' IN (:ids)
        AND m.validity_period->>'endDate' IS NULL
    `,
    {
      replacements: {
        ids: programmes.map(p => p.groupId)
      }
    }
  )

  // filter the incomplete entries that do not have a name in all languages
  res.send(studytracks.filter(st => st.name.fi && st.name.en && st.name.sv))
})

router.use('/', grapaRouter)

module.exports = router
