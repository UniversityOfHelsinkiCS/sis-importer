const express = require('express')
const { Op } = require('sequelize')
const { addMonths } = require('date-fns')
const models = require('../models/index.js')

const router = express.Router()

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
  'urn:code:course-unit-realisation-type:teaching-participation-seminar',
  'urn:code:course-unit-realisation-type:independent-work-project', // ship these to the norppa side even if they arent widely used
]

router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const teacherCourses = await models.CourseUnitRealisation.findAll({
    where: {
      responsibilityInfos: {
        [Op.contains]: [{ personId: teacherId }], // note that '{ personId: teacherId }' would not work. In pg, array containment is more like checking for union
      },
      activityPeriod: {
        endDate: {
          [Op.gt]: new Date(),
        },
        startDate: {
          [Op.lt]: addMonths(new Date(), 6),
        },
      },
      courseUnitRealisationTypeUrn: {
        [Op.in]: validRealisationTypes
      }
    },
  })

  res.send(teacherCourses)
})

module.exports = router
