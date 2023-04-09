const express = require('express')
const { Op } = require('sequelize')
const { addMonths } = require('date-fns')
const models = require('../models/index.js')

const router = express.Router()

router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const teacherCourses = await models.CourseUnit.findAll({
    where: {
      responsibilityInfos: {
        [Op.contains]: [{ personId: teacherId }], // note that '{ personId: teacherId }' would not work. In pg, array containment is more like checking for union
      },
      validityPeriod: {
        endDate: {
          [Op.gt]: new Date(),
        },
        startDate: {
          [Op.lt]: addMonths(new Date(), 6),
        },
      },
    },
  })

  res.send(teacherCourses)
})

module.exports = router
