const { Op } = require('sequelize')
const { CourseUnitRealisation, Enrolment, Person } = require('../models')

const router = require('express').Router()

/**
 *
 * @param {object} req
 * @returns {{teacherId: any, studentNumbers: any[]}} the parsed body
 */
const parseParams = req => {
  const { teacherId, studentNumbers } = req.body

  if (!teacherId) {
    throw {
      status: 400,
      message: 'Missing teacherId',
    }
  }

  if (!Array.isArray(studentNumbers)) {
    throw {
      status: 400,
      message: 'Invalid studentIds',
    }
  }

  return { teacherId, studentNumbers }
}

const earliestDate = () => new Date(new Date().setMonth(new Date().getMonth() - 8))

/**
 * Returns those student numbers to which the teacher (teacherId in body) has access,
 * by the students having enrolled to courses teached by teacher.
 * Time is limited by course_unit_realisation -> enrolment_period -> (endDate-field in json)
 * because just enrolments sometimes have null date
 */
router.post('/', async (req, res) => {
  try {
    const { teacherId, studentNumbers } = parseParams(req)

    const students = await Person.findAll({
      attributes: ['studentNumber'],
      where: {
        studentNumber: {
          [Op.in]: studentNumbers,
        },
      },
      include: [
        {
          model: Enrolment,
          as: 'enrolments',
          include: [
            {
              model: CourseUnitRealisation,
              as: 'courseUnitRealisation',
              required: true,
              where: {
                responsibilityInfos: {
                  [Op.contains]: [
                    {
                      personId: teacherId,
                      roleUrn: 'urn:code:course-unit-realisation-responsibility-info-type:responsible-teacher',
                    },
                  ],
                },
                enrolment_period: { endDateTime: { [Op.gte]: earliestDate() } },
              },
            },
          ],
        },
      ],
    })

    return res.send(students.map(student => student.studentNumber))
  } catch (err) {
    if (err.status)
      // handle only this kind of error
      return res.status(err.status).send(err)

    // its internal error, dont handle here
    throw err
  }
})

module.exports = router
