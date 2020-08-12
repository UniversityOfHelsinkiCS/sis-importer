const router = require('express').Router()
const { Op } = require('sequelize')
const models = require('../models')
const sisClient = require('../utils/sisClient')
const { Organisation, Education } = require('../models')

const MATLU = 'H50'

const getFallSemesterCode = year => (year - 1950) * 2 + 1
const getSpringSemesterCode = year => (year - 1950) * 2

const isBachelorsStudyRight = urn => {
  const splitted = urn.split(':')
  const educationType = splitted[3]
  const degree = splitted[4]
  return educationType === 'degree-education' && ['bachelors-and-masters-degree', 'bachelors-degree'].includes(degree)
}

const studentNumberToPersonId = async studentNumber => {
  const person = await models.Person.findOne({
    where: {
      studentNumber,
    },
  })

  if (!person) throw new Error('Person not found')

  return person.id
}

router.get('/:studentId/studyrights', async (req, res) => {
  try {
    const { studentId } = req.params
    if (!studentId) return res.status(403).send('StudentId required')

    const personId = await studentNumberToPersonId(studentId)
    const matluStudyRights = await models.StudyRight.findAll({
      where: {
        personId,
        '$organisation.code$': MATLU,
      },
      include: [Organisation, Education],
    })

    if (!matluStudyRights.length) return res.json([])

    const matluBachelorsStudyrights = matluStudyRights.filter(studyRight =>
      isBachelorsStudyRight(studyRight.education.educationType)
    )

    const elements = matluBachelorsStudyrights.map(({ valid, education }) => {
      return {
        code: education.code,
        start_date: valid.startDate,
        end_date: valid.endDate,
      }
    })

    res.json([
      {
        faculty_code: MATLU,
        elements,
      },
    ])
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

router.get('/:studentId/enrollment_statuses/:year', async (req, res) => {
  try {
    const { studentId, year } = req.params

    const personId = await studentNumberToPersonId(studentId)

    const { termRegistrations } = await models.TermRegistrations.findOne({
      where: {
        studentId: personId,
      },
    })

    const relevantRegistrations = termRegistrations
      .filter(({ studyTerm }) => {
        return studyTerm.studyYearStartYear === Number(year)
      })
      .reduce((acc, cur) => {
        return {
          ...acc,
          [cur.studyTerm.termIndex === 0 ? 'fall' : 'spring']: {
            statutoryAbsence: cur.statutoryAbsence,
            termRegistrationType: cur.termRegistrationType,
          },
        }
      }, {})

    res.status(200).send(relevantRegistrations)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

router.get('/:studentId/semester_enrollments', async (req, res) => {
  try {
    const { studentId } = req.params

    const personId = await studentNumberToPersonId(studentId)

    const { termRegistrations } = await models.TermRegistrations.findOne({
      where: {
        studentId: personId,
      },
    })

    const mankeled = termRegistrations.map(({ studyTerm, statutoryAbsence, termRegistrationType }) => {
      const semester_code =
        studyTerm.termIndex === 0
          ? getFallSemesterCode(studyTerm.studyYearStartYear)
          : getSpringSemesterCode(studyTerm.studyYearStartYear)

      let semester_enrollment_type_code = 1 // present
      if (statutoryAbsence) semester_enrollment_type_code = 2

      return {
        semester_enrollment_type_code,
        semester_code,
      }
    })

    res.status(200).send(mankeled)
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

    res.send(!!courseAttainments.length)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

/**
 * Check how many credits student obtained during a specific academic year.
 * @startYear Example: 2020, means whole 2020 academic year.
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
        type: 'CourseUnitAttainment',
        misregistration: false,
        primary: true,
        attainmentDate: {
          [Op.between]: [semesterStart, semesterEnd],
        },
      },
      attributes: ['credits'],
    })

    const fuksiYearCredits = fuksiYearAttainments.reduce((acc, cur) => {
      return acc + cur.credits
    }, 0)

    res.status(200).json(fuksiYearCredits)
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

    res.send(enrollmentOK)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

/**
 * Checks if student with @studentId has enrolled for a course, under organisation @studyTrackId
 * organisation example; organisation: { code: '570-K001', name: { fi: 'Biologian kandiohjelma' } }
 */
router.get('/:studentId/enrolled/study_track/:studyTrackId', async (req, res) => {
  try {
    const { studentId, studyTrackId } = req.params
    if (!studentId) return res.status(403).send('StudentId required')
    if (!studyTrackId) return res.status(403).send('StudyTrackId required')

    const enrolledCourses = await sisClient.getEnrolmentsByStudentNumber(studentId)

    const studyTrackEnrollmentOK = !!enrolledCourses.find(({ courseUnitRealisation, courseUnit }) => {
      return (
        new Date(courseUnitRealisation.activityPeriod.endDate).getTime() > new Date().getTime() &&
        courseUnit.organisations.find(({ organisation }) => organisation.code === studyTrackId)
      )
    })

    res.send(studyTrackEnrollmentOK)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

router.get('/min_max_semesters', async (req, res) => {
  try {
    const now = new Date().getTime()
    const all = await models.StudyYear.findAll()
    const min = '2008-08-01'

    const max = all.find(({ valid }) => {
      return new Date(valid.endDate).getTime() > now && new Date(valid.startDate).getTime() <= now
    }).valid.startDate

    res.status(200).json({
      min,
      max,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

module.exports = router
