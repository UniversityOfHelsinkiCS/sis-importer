const express = require('express')
const models = require('../models')
const { Op } = require('sequelize')
const router = express.Router()

// Get grades by multiple grade scales
router.get('/', async (req, res) => {
  const { codes } = req.query

  const query = {
    id: {
      [Op.in]: Array.isArray(codes) ? codes : [codes],
    },
  }

  const gradeScales = await models.GradeScale.findAll({
    where: codes ? query : {},
    raw: true,
  })

  if (!gradeScales.length) return res.status(404).send(`No grade scales found`)

  const gradesByGradeScaleId = gradeScales.reduce((acc, { id, grades }) => {
    acc[id] = grades
    return acc
  }, {})

  res.send(gradesByGradeScaleId)
})

// Get grades by sing grade scale id
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const gradeScale = await models.GradeScale.findOne({
    where: { id },
  })

  if (!gradeScale) return res.status(404).send(`Garde scale with id ${id} does not exist`)

  res.send(gradeScale.grades)
})

module.exports = router
