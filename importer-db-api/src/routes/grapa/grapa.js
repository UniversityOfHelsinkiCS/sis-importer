const express = require('express')
const models = require('../../models')

const { relevantAttributes } = require('./config')

const router = express.Router()

const grapaRouter = express.Router()

grapaRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const persons = await models.Person.findAll({
    attributes: relevantAttributes.persons,
    order: [['id', 'DESC']],
    limit,
    offset,
  })

  res.send(persons)
})

router.use('/', grapaRouter)

module.exports = router
