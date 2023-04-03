const express = require('express')
const { Op } = require('sequelize')
const { format, add } = require('date-fns')

const models = require('../models')

const router = express.Router()

router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const currentDate = new Date()
  const limitDate = add(currentDate, { months: 6 })

  const courses = await models.CourseUnit.findAll({
    where: {
      validityPeriod: {
        startDate: {
          [Op.lt]: format(limitDate, 'yyyy-MM-dd'),
        },
        endDate: {
          [Op.gt]: format(currentDate, 'yyyy-MM-dd'),
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
