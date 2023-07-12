const { Op } = require('sequelize')
const { CourseUnitRealisation, Enrolment, Person } = require('../models')

const router = require('express').Router()

/**
 *
 * @param {object} req
 * @returns {{teacherId: any, studentNumbers: any[]}} the parsed body
 */
const parseParams = req => {
  const { teacherId } = req.params
  const { studentNumbers } = req.body

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

/**
 *
 */
router.get('/:teacherId', async (req, res) => {
  try {
    const { teacherId, studentNumbers } = parseParams(req)

    const students = await Person.findAll({
      attributes: ['id'],
      where: {
        studentNumber: {
          [Op.in]: studentNumbers,
        },
      },
    })

    const courseUnitRealisations = await CourseUnitRealisation.findAll({
      where: {
        responsibilityInfos: {
          [Op.contains]: [{ personId: teacherId }], // note that '{ personId: teacherId }' would not work. In pg, array containment is more like checking for intersection
        },
      },
    })

    const enrolments = await Enrolment.findAll({
      where: {
        courseUnitRealisationId: {
          [Op.in]: courseUnitRealisations.map(cur => cur.id),
        },
      },
    })

    const accessStatuses = students.map(student => ({
      id: student.id,
      accessible: enrolments.some(enr => enr.personId === student.id),
    }))

    return res.send(accessStatuses)
  } catch (err) {
    if (err.status)
      // handle only this kind of error
      return res.status(err.status).send(err)

    // its internal error, dont handle here
    throw err
  }
})

module.exports = router
