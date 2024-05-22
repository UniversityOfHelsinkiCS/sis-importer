const express = require('express')
const { Op } = require('sequelize')

const models = require('../models')

const router = express.Router()

router.get('/', async (req, res) => {
  const { codes: codesString } = req.query

  // We don't want to return every single course unit if codes query parameter is not defined
  if (!codesString) {
    return res.send([])
  }

  const codes = codesString.split(',').filter(Boolean)

  if (codes.length === 0) {
    return res.send([])
  }

  const courseUnits = await models.CourseUnit.findAll({
    where: {
      code: {
        [Op.in]: codes
      }
    }
  })

  res.send(courseUnits)
})

router.get('/programme/:programmeCode', async (req, res) => {
  const { params, query } = req
  const programmeCode = params.programmeCode // '500-K005' = CS kandi

  const organisation = await models.Organisation.findOne({
    where: {
      code: programmeCode
    }
  })

  if (!organisation) return res.status(404).send('No such organization, use different code e.g. 500-K005')

  const courses = (await organisation.getCourseUnits()).map(unit => ({
    id: unit.id,
    code: unit.code,
    name: unit.name,
    validityPeriod: unit.validityPeriod,
    groupId: unit.groupId,
    credits: unit.credits
  }))

  const searchString = query.search || ''

  const filteredCourses = courses.filter(course => {
    const searchFields = [course.id, course.code, ...Object.values(course.name)]
    return searchFields.find(f => f.includes(searchString))
  })

  res.send(filteredCourses)
})

module.exports = router
