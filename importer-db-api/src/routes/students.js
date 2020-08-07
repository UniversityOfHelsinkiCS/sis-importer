const router = require('express').Router()
const { Op } = require('sequelize')
const models = require('../models')
const sisClient = require('../utils/sisClient')

router.get('/:studentId/study_rights', async (req, res) => {
  try {
    const { studentId } = req.params
    if (!studentId) return res.status(403).send('StudentId required')

    const studyRights = await models.StudyRight.findAll({
      where: {
        personStudentNumber: studentId,
      },
    })

    res.send(studyRights)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

router.get('/:studentId/has_passed_course/:code', async (req, res) => {
  try {
    const { studentId, code } = req.params
    if (!studentId) return res.status(403).send('StudentId required')
    if (!code) return res.status(403).send('CourseCode required')

    const courseUnitIds = await models.CourseUnit.findAll({
      where: {
        code,
      },
      attributes: ['id'],
    }).map(e => e.id)

    const courseAttainments = await models.Attainment.findAll({
      where: {
        personStudentNumber: studentId,
        state: 'ATTAINED',
        courseUnitId: {
          [Op.in]: courseUnitIds,
        },
      },
    })

    res.json({
      passed: !!courseAttainments.length,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

/**
 * Check how many credits student obtained during a specific academic year.
 * @param startYear Example: 2020, means whole 2020 academic year.
 */
router.get('/:studentId/fuksi_year_credits/:startYear', async (req, res) => {
  try {
    const { studentId, startYear } = req.params
    if (!studentId) return res.status(403).send('StudentId required')
    if (!startYear) return res.status(403).send('StartYear required')

    const semesterInfo = await models.StudyYear.findOne({
      where: {
        startYear: startYear,
      },
    })

    const semesterStart = new Date(semesterInfo.valid.startDate)
    const semesterEnd = new Date(semesterInfo.valid.endDate)

    const fuksiYearAttainments = await models.Attainment.findAll({
      where: {
        personStudentNumber: studentId,
        state: 'ATTAINED',
        misregistration: false,
        attainmentDate: {
          [Op.between]: [semesterStart, semesterEnd],
        },
      },
      attributes: ['credits'],
    })

    const fuksiYearCredits = fuksiYearAttainments.reduce((acc, cur) => {
      return acc + cur.credits
    }, 0)

    res.json({ fuksiYearCredits })
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

router.get('/:studentId/enrollment_statuses/:year', async (req, res) => {
  try {
    const { studentId, year } = req.params

    const { id: acualId } = await models.Person.findOne({
      where: {
        studentNumber: studentId,
      },
    })

    const { termRegistrations } = await models.TermRegistrations.findOne({
      where: {
        studentId: acualId,
      },
    })

    const relevantRegistrations = termRegistrations
      .filter(({ studyTerm }) => {
        return studyTerm.studyYearStartYear === Number(year)
      })
      .reduce(
        (acc, cur) => {
          return {
            ...acc,
            [cur.studyTerm.termIndex === 0 ? 'fall' : 'spring']: {
              statutoryAbsence: cur.statutoryAbsence,
              termRegistrationType: cur.termRegistrationType,
            },
          }
        },
        { year }
      )

    res.status(200).send(relevantRegistrations)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

router.get('/:studentId/enrolled/course/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params
    if (!studentId) return res.status(403).send('StudentId required')
    if (!courseId) return res.status(403).send('CourseId required')

    const enrolledCourses = await sisClient.getEnrolmentsByStudentNumber(studentId)

    const enrollmentOK = !!enrolledCourses.find(({ courseUnitRealisation, courseUnit }) => {
      return (
        new Date(courseUnitRealisation.activityPeriod.endDate).getTime() > new Date().getTime() &&
        courseUnit.code === courseId
      )
    })

    res.json({ enrollmentOK })
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

router.get('/:studentId/enrolled/study_track/:studyTrackId', async (req, res) => {
  try {
    const { studentId, studyTrackId } = req.params
    if (!studentId) return res.status(403).send('StudentId required')
    if (!studyTrackId) return res.status(403).send('StudyTrackId required')

    const enrolledCourses = await sisClient.getEnrolmentsByStudentNumber(studentId)

    const studyTrackEnrollmentOK = !!enrolledCourses.find(({ courseUnitRealisation, courseUnit }) => {
      return (
        new Date(courseUnitRealisation.activityPeriod.endDate).getTime() > new Date().getTime() &&
        courseUnit.universityOrgs.find(o => o.code === studyTrackId)
      )
    })

    res.json({ studyTrackEnrollmentOK })
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

module.exports = router
