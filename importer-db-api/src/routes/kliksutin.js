const express = require('express')
const { Op } = require('sequelize')
const dateFns = require('date-fns')

const models = require('../models')

const router = express.Router()

router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const date = new Date()

  const courses = await models.CourseUnitRealisation.findAll({
    where: {
      activityPeriod: {
        startDate: {
          [Op.gt]: dateFns.format(date, 'yyyy-MM-dd'),
        },
      },
    },
  })

  const teacherCourses = courses.filter(({ responsibilityInfos }) =>
    responsibilityInfos.some(({ personId }) => personId === teacherId)
  )

  res.send(teacherCourses)
})

module.exports = router
