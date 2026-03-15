const express = require('express')
const { Op } = require('sequelize')

const models = require('../models')
const logger = require('../utils/logger')

const router = express.Router()

/**
 * Get all course unit realisations where person is responsible
 * personId is the Sisu person ID
 * Filters to only show realisations with activity periods that are now or in the future
 */
router.get('/employees/:personId/course_unit_realisations', async (req, res) => {
  try {
    const { personId } = req.params
    const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD

    const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
      attributes: { exclude: ['studyGroupSets', 'customCodeUrns'] },
      where: {
        responsibilityInfos: {
          [Op.contains]: [{ personId }]
        },
        courseUnitRealisationTypeUrn: {
          [Op.notIn]: [
            'urn:code:course-unit-realisation-type:exam-electronic',
            'urn:code:course-unit-realisation-type:exam-midterm',
            'urn:code:course-unit-realisation-type:exam-exam'
          ]
        },
        [Op.or]: [
          {
            activityPeriod: {
              endDate: {
                [Op.gte]: today
              }
            }
          },
          {
            activityPeriod: {
              endDate: null
            }
          }
        ]
      }
    })

    return res.send(courseUnitRealisations)
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

/**
 * Get enrolled students for a course unit realisation
 * Returns only students with state "ENROLLED" and minimal fields
 */
router.get('/course_unit_realisations/:id/enrolments', async (req, res) => {
  const { id } = req.params

  const enrolments = await models.Enrolment.findAll({
    where: {
      courseUnitRealisationId: id,
      state: 'ENROLLED'
    }
  })

  const personIds = enrolments.map(e => e.personId)

  const persons = await models.Person.findAll({
    where: {
      id: {
        [Op.in]: personIds
      }
    },
    attributes: ['id', 'eduPersonPrincipalName', 'firstNames', 'lastName', 'studentNumber']
  })

  const personHash = persons.reduce((acc, p) => {
    acc[p.id] = p.dataValues
    return acc
  }, {})

  const result = enrolments.map(e => {
    const student = personHash[e.personId]
    return {
      student: {
        eduPersonPrincipalName: student.eduPersonPrincipalName,
        firstNames: student.firstNames,
        lastName: student.lastName,
        studentNumber: student.studentNumber
      }
    }
  })

  res.send(result)
})

/**
 * Get students by student numbers
 * Accepts a list of student numbers in the request body
 * Returns minimal student information
 */
router.post('/students', async (req, res) => {
  try {
    const { studentNumbers } = req.body

    if (!studentNumbers || !Array.isArray(studentNumbers)) {
      return res.status(400).json({ error: 'studentNumbers array is required' })
    }

    const persons = await models.Person.findAll({
      where: {
        studentNumber: {
          [Op.in]: studentNumbers
        }
      },
      attributes: ['eduPersonPrincipalName', 'firstNames', 'lastName', 'studentNumber']
    })

    const result = persons.map(p => ({
      student: {
        eduPersonPrincipalName: p.eduPersonPrincipalName,
        firstNames: p.firstNames,
        lastName: p.lastName,
        studentNumber: p.studentNumber
      }
    }))

    res.send(result)
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

module.exports = router
