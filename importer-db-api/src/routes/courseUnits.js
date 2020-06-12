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

router.get('/programme/:programmeCode', async (req, res) => {
  const { params, query } = req
  const programmeCode = params.programmeCode // 'KH50_005' = CS kandi
  const module = await models.Module.findOne({
    where: {
      code: programmeCode,
    },
  })
  let courses = {}

  if (module) courses = await module.getCourses()

  if (!module) {
    const organisation = await models.Organisation.findOne({
      where: {
        code: programmeCode,
      },
    })
    courses = await organisation.getCourses()
  }

  res.send({
    course_units: courses.filter(course => {
      const searchString = query.search || ''
      const searchFields = [course.id, course.code, ...Object.values(course.name)]
      return searchFields.find(f => f.includes(searchString))
    }),
  })
})

module.exports = router
