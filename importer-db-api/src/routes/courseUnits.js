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
  const courses = await module.getCourses()
  const searchedCourses = Object.values(courses).map(course => ({
    id: course.id,
    code: course.code,
    name: course.name
  })).filter(course => {
    const searchString = query.search || ""
    const searchFields = [course.id, course.code, ...Object.values(course.name)]
    return searchFields.find(f => f.includes(searchString))
  })

  res.send({
    course_units: searchedCourses,
  })
})

module.exports = router
