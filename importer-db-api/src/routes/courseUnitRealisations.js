const express = require('express')
const models = require('../models')
const router = express.Router()

router.get('/', async (req, res) => {
  const courseUnitRealisations = await models.CourseUnitRealisation.findOne()
  const safe = [{ name: courseUnitRealisations.name }] // safe when testing ci
  res.send(safe)
})

module.exports = router
