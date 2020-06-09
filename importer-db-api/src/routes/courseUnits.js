const express = require('express')
const models = require('../models')
const router = express.Router()

router.get('/', async (req, res) => {
  const courseUnits = await models.CourseUnit.findOne()
  res.send(courseUnits)
})

module.exports = router
