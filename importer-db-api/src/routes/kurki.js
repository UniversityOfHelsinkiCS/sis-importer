const express = require('express')

const models = require('../models')
const { NotFoundError } = require('../errors')

const router = express.Router()

router.get('/students/:id', async (req, res) => {
  const {
    params: { id },
  } = req

  const student = await models.Person.findOne({
    where: {
      id,
    },
    include: [{ model: models.StudyRight, include: [models.Organisation] }],
  })

  if (!student) {
    throw new NotFoundError(`Student with id ${id} does not exist`)
  }

  res.send(student)
})

module.exports = router
