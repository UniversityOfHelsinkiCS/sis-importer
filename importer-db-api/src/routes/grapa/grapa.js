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
      model: models.Person,
    }
  )

  res.send(personsWithStudyRightOrEmployeeNumber)
})

router.use('/', grapaRouter)

module.exports = router
