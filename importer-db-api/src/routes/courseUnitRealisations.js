const express = require('express')
const models = require('../models')
const router = express.Router()

router.get('/', async (req, res) => {
  const courseUnitRealisations = await models.CourseUnitRealisation.findOne()
  res.send(courseUnitRealisations)
})

module.exports = router
