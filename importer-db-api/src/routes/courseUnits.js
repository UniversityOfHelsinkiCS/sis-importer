const express = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')

const models = require('../models')
const { NotFoundError } = require('../errors')

const router = express.Router()

router.get('/:code/course_unit_realisations', async (req, res) => {
  const { code } = req.params

  const courseUnit = await models.CourseUnit.findOne({
    where: {
      code,
    },
  })

  if (!courseUnit) {
    throw new NotFoundError(`Course unit with code ${code} is not found`)
  }

  const { groupId } = courseUnit

  const assessmentItem = await models.AssessmentItem.findOne({
    where: {
      primary_course_unit_group_id: groupId,
    },
  })

  const { id: assessmentItemId } = assessmentItem

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    where: {
      assessmentItemIds: {
        [Op.contains]: [assessmentItemId],
      },
    },
  })

  res.send(courseUnitRealisations)
})

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

  const groupedCourseUnits = _.groupBy(courseUnits, ({ code }) => code)

  const groupedUniqueCourseUnits = _.mapValues(groupedCourseUnits, courseUnitsByCode =>
    _.maxBy(courseUnitsByCode, ({ validityPeriod }) =>
      validityPeriod && validityPeriod.endDate ? new Date(validityPeriod.endDate) : undefined
    )
  )

  const uniqueCourseUnits = _.values(groupedUniqueCourseUnits);

  res.send(uniqueCourseUnits)
})

module.exports = router
