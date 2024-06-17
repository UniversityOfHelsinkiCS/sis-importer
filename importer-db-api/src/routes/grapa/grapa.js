const express = require('express')
const { relevantAttributes } = require('./config')
const models = require('../../models')
const { sequelize } = require('../../config/db')
const { isRefreshingPersonStudyRightsView } = require('../palaute/personStudyRightsView')

const router = express.Router()

const grapaRouter = express.Router()

grapaRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  if (isRefreshingPersonStudyRightsView()) {
    return res.send({
      waitAndRetry: true,
      message: 'Person study rights view is being refreshed',
      waitTime: 10_000
    })
  }

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

grapaRouter.get('/studytracks', async (req, res) => {
  const { limit, offset, codes } = req.query
  if (!limit || !offset || !codes) return res.sendStatus(400)

  const programmes = (
    await models.Module.findAll({
      where: {
        code: codes
      }
    })
  ).filter(p => !p.validityPeriod?.endDate)

  if (programmes.length === 0) return res.send([])

  const [studytracks] = await sequelize.query(
    `
      SELECT distinct on (m.name) m.name, m.code, s.accepted_selection_path->>'educationPhase2GroupId' as programGroupId
      FROM "modules" m
      JOIN "studyrights" s ON m."group_id" = s.accepted_selection_path->>'educationPhase2ChildGroupId'
      WHERE s.accepted_selection_path->>'educationPhase2GroupId' IN (:ids)
        AND m.validity_period->>'endDate' IS NULL
        AND s.document_state = 'ACTIVE'
      ORDER BY m.name DESC
      LIMIT :limit OFFSET :offset
    `,
    {
      replacements: {
        ids: programmes.map(p => p.groupId),
        limit,
        offset
      }
    }
  )

  const studyTracksWithProgramCodes = studytracks.map(st => ({
    ...st,
    programCode: programmes.find(p => p.groupId === st.programGroupId).code
  }))

  // filter the incomplete entries that do not have a name in all languages
  res.send(studyTracksWithProgramCodes.filter(st => st.name.fi && st.name.en && st.name.sv))
})

router.use('/', grapaRouter)

module.exports = router
