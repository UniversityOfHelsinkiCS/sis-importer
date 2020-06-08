const express = require('express')
const models = require('../models')
const router = express.Router()

router.get('/', async (req, res) => {
  const courseUnits = await models.CourseUnit.findOne()
  const safe = [{ name: courseUnits.name, code: courseUnits.code }] // safe when testing ci
  res.send(safe)
})

module.exports = router
