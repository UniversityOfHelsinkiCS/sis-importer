const router = require('express').Router()
const { Op } = require('sequelize')
const models = require('../models')
const sisClient = require('../utils/sisClient')
const acualSisClient = require('../utils/sisClient/acualSisClient')
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

router.use('/:studentNumber', async (req, res, next) => {
  const student = await models.Person.findOne({
    where: {
      studentNumber: req.params.studentNumber,
    },
  })

  if (!student) return res.status(500).send({ error: 'student not found' })
  req.student = student
  next()
})

router.get('/:studentNumber/studyrights', async (req, res) => {
  try {
    const matluStudyRights = await models.StudyRight.findAll({
      where: {
        personId: req.student.id,
        '$organisation.code$': MATLU,
      },
      include: [Organisation, Education],
    })

    if (!matluStudyRights.length) return res.json([])

    const matluBachelorsStudyrights = matluStudyRights.filter(studyRight =>
      studyRight.education && isBachelorsStudyRight(studyRight.education.educationType)
    )

    let elements = []
    for (let { valid, education } of matluBachelorsStudyrights) {
      const module = await models.Module.findOne({
        where: {
          groupId: education.groupId.replace('EDU', 'DP'), // nice nice
        },
      })

      elements.push({
        code: module.code,
        start_date: valid.startDate,
        end_date: valid.endDate,
      })
    }

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

router.get('/:studentNumber/enrollment_statuses/:year', async (req, res) => {
  try {
    const { year } = req.params

    const { termRegistrations } = await models.TermRegistrations.findOne({
      where: {
        studentId: req.student.id,
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

router.get('/:studentNumber/semester_enrollments', async (req, res) => {
  try {
    const { termRegistrations } = await models.TermRegistrations.findOne({
      where: {
        studentId: req.student.id,
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

router.get('/:studentNumber/has_passed_course/:code', async (req, res) => {
  try {
    const { code } = req.params
    if (!code) return res.status(403).send('CourseCode required')

    const courseUnitIds = await models.CourseUnit.findAll({
      where: {
        code,
      },
      attributes: ['id'],
    }).map(e => e.id)

    const courseAttainments = await models.Attainment.findAll({
      where: {
        personId: req.student.id,
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
router.get('/:studentNumber/fuksi_year_credits/:startYear', async (req, res) => {
  try {
    const { startYear } = req.params
    if (!startYear) return res.status(403).send('StartYear required')

    // Dont have this data:
    // const semesterInfo = await models.StudyYear.findOne({
    //   where: {
    //     startYear: startYear,
    //   },
    // })

    const semesterStart = new Date(`${startYear}-08-01`)
    const semesterEnd = new Date(`${parseInt(startYear)+1}-08-01`)

    const fuksiYearAttainments = await models.Attainment.findAll({
      where: {
        personId: req.student.id,
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

router.get('/:studentNumber/enrolled/course/:courseId', async (req, res) => {
  try {
    const { studentNumber, courseId } = req.params
    if (!courseId) return res.status(403).send('CourseId required')

    const enrolledCourses = await acualSisClient(studentNumber)
    console.log('VOITTO', enrolledCourses)

    const enrollmentOK = !!enrolledCourses.find(({ courseUnitRealisation, courseUnit }) => {
      return (
        new Date(courseUnitRealisation.activityPeriod.endDate).getTime() > new Date().getTime() &&
        courseUnit.code === courseId
      )
    })

    res.send(enrollmentOK)
  } catch (err) {
    console.log(err)
    res.status(500).send(err.response)
  }
})

/**
 * Checks if student with @studentNumber has enrolled for a course, under organisation @studyTrackId
 * organisation example; organisation: { code: '570-K001', name: { fi: 'Biologian kandiohjelma' } }
 */
router.get('/:studentNumber/enrolled/study_track/:studyTrackId', async (req, res) => {
  try {
    const { studyTrackId } = req.params
    if (!studyTrackId) return res.status(403).send('StudyTrackId required')

    const enrolledCourses = await sisClient.getEnrolmentsByStudentNumber(req.student.studentNumber)

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

module.exports = router
