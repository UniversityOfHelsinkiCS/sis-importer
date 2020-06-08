const express = require('express')
const models = require('../models')
const router = express.Router()
const { Op } = require('sequelize')

router.get('/', async (req, res) => {
  const { query } = req
  console.log(query)
  const courseUnit = await models.CourseUnit.findOne({
    where: {
      code: query.code,
    },
  })
  if (!courseUnit) return res.sendStatus(404)

  const { groupId } = courseUnit

  const assessmentItem = await models.AssessmentItem.findOne({
    where: {
      primary_course_unit_group_id: groupId,
    },
  })

  const { id: assessmentItemId } = assessmentItem

  console.log('ID', assessmentItemId)

  const courseUnitRealisations = await models.CourseUnitRealisation.findOne({
    where: {
      assessmentItemIds: {
        [Op.contains]: [assessmentItemId],
      },
    },
  })

  res.send(courseUnitRealisations)
})

module.exports = router
