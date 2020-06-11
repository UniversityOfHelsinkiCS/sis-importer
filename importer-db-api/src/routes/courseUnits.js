const express = require('express')
const { Op } = require('sequelize')

const models = require('../models')

const router = express.Router()

router.get('/', async (req, res) => {
  const { codes: codesString } = req.query

  // We don't want to return every single course unit if codes query parameter is not defined
  if (!codesString) {
    return []
  }

  const codes = codesString.split(',').filter(Boolean)

  if (codes.length === 0) {
    return []
  }

  const courseUnits = await models.CourseUnit.findAll({
    where: {
      code: {
        [Op.in]: codes,
      },
    },
  })

  res.send(courseUnits)
})

module.exports = router
