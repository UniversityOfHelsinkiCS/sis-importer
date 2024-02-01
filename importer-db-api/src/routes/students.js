const router = require('express').Router()
const sequelize = require('sequelize')
const { Op } = require('sequelize')
const models = require('../models')
const { Organisation, Education, CourseUnitRealisation, Person, CourseUnit, Disclosure } = require('../models')

const MATLU = 'H50'

const getFallSemesterCode = year => (year - 1950) * 2 + 1
const getSpringSemesterCode = year => (year - 1950) * 2 + 2

/**
 * Post list of persons and get list of students with their CS study right id
 */
router.post('/study-rights', async (req, res) => {
  const studentNumbers = req.body

  if (!Array.isArray(studentNumbers)) return res.status(400).send({ error: 'Input should be an array' })
  const studyRights = await models.StudyRight.findAll({
    where: {
      '$person.student_number$': { [Op.in]: studentNumbers },
      '$organisation.code$': MATLU,
    },
    order: [
      ['id', 'DESC'],
      ['modificationOrdinal', 'DESC'],
    ],
    include: [Organisation, Education, Person],
    raw: true,
    nest: true,
  })
  res.send(
    studyRights.reduce((acc, { id: studyRightId, person }) => {
      const { id: personId, studentNumber } = person
      acc[studentNumber] = {
        studyRightId,
        personId,
      }
      return acc
    }, {})
  )
})

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

/**
 * Batch convert list of student numbers to person objects.
 * Note: For now no warnings raised if some invalid student numbers found...
 */
router.post('/', async (req, res) => {
  const studentNumbers = req.body
  if (!Array.isArray(studentNumbers)) return res.status(400).send({ error: 'Input should be an array' })
  const persons = await models.Person.findAll({
    where: {
      studentNumber: { [Op.in]: studentNumbers },
    },
  })
  return res.send(persons)
})

router.get('/:studentNumber/studyrights', async (req, res) => {
  const studyRights = await models.StudyRight.findAll({
    where: {
      personId: req.student.id,
      '$organisation.code$': MATLU,
    },
    attributes: [sequelize.literal('DISTINCT ON (studyright.id) *')].concat(
      Object.keys(models.StudyRight.rawAttributes)
    ),
    order: [
      ['id', 'DESC'],
      ['modificationOrdinal', 'DESC'],
    ],
    include: [Organisation, Education],
  })

  if (!studyRights.length) return res.json([])

  let result = []

  for (const { id, valid, education, organisation } of studyRights) {
    // Most old studyrights dont have educations
    const module = education
      ? await models.Module.findOne({
          where: {
            groupId: education.groupId.replace('EDU', 'DP'), // nice nice
          },
        })
      : {
          code: undefined,
        }

    const elements = [
      {
        code: module ? module.code : undefined,
        start_date: valid.startDate,
        end_date: valid.endDate,
      },
    ]

    result.push({
      faculty_code: organisation.code,
      elements,
      id,
      valid: {
        start_date: valid.startDate,
        end_date: valid.endDate,
      },
    })
  }

  // might be possible to sort earlier by studyright
  const sortedResults = result.sort((a, b) => new Date(a.elements[0].start_date) - new Date(b.elements[0].start_date))
  res.json(Object.values(sortedResults))
})

router.get('/:studentNumber/enrollment_statuses/:year', async (req, res) => {
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
})

router.get('/:studentNumber/semester_enrollments', async (req, res) => {
  const termRegistrations = (
    await models.TermRegistrations.findAll({
      where: {
        studentId: req.student.id,
      },
    })
  )
    .map(termReg => termReg.termRegistrations)
    .reduce((pre, cur) => pre.concat(cur), [])

  const mankeled = termRegistrations.map(({ studyTerm, statutoryAbsence, termRegistrationType }) => {
    const semester_code =
      studyTerm.termIndex === 0
        ? getFallSemesterCode(studyTerm.studyYearStartYear)
        : getSpringSemesterCode(studyTerm.studyYearStartYear)

    let semester_enrollment_type_code = 1 // present
    if (termRegistrationType === 'MISSING' || termRegistrationType === 'NONATTENDING') {
      semester_enrollment_type_code = 2 // absent
    } else if (statutoryAbsence) {
      semester_enrollment_type_code = 3 // absent but with a good reason
    }

    return {
      semester_enrollment_type_code,
      semester_code,
    }
  })

  res.status(200).send(mankeled)
})

/* */

router.get('/:studentNumber/acual_semester_enrollments', async (req, res) => {
  const studyrightTerms = await models.TermRegistrations.findAll({
    where: {
      studentId: req.student.id,
    },
  }).filter(r => !r.studyRightId.includes('hy-avoin-ew-sr'))

  const termsPerRight = studyrightTerms.reduce((set, { termRegistrations, studyRightId }) => {
    console.log(JSON.stringify(termRegistrations), null, 2)
    const mankeled = termRegistrations.map(({ studyTerm, statutoryAbsence, termRegistrationType }) => {
      const semester_code =
        studyTerm.termIndex === 0
          ? getFallSemesterCode(studyTerm.studyYearStartYear)
          : getSpringSemesterCode(studyTerm.studyYearStartYear)

      let semester_enrollment_type_code = 1 // present
      if (statutoryAbsence) {
        semester_enrollment_type_code = 3 // absent but with a good reason
      } else if (
        termRegistrationType === 'MISSING' ||
        termRegistrationType === 'NEGLECTED' ||
        termRegistrationType === 'NONATTENDING'
      ) {
        semester_enrollment_type_code = 2 // absent
        console.log(termRegistrationType)
      }

      return {
        semester_enrollment_type_code,
        termRegistrationType,
        semester_code,
      }
    })

    set[studyRightId] = mankeled

    return set
  }, {})

  res.status(200).send(termsPerRight)
})

/* */

router.get('/:studentNumber/rapo_semester_enrollments', async (req, res) => {
  const termRegistrations = await models.TermRegistrations.findAll({
    where: {
      studentId: req.student.id,
    },
  })

  const mangel = studyright => {
    const innerMangel = t => {
      const semester_code =
        t.studyTerm.termIndex === 0
          ? getFallSemesterCode(t.studyTerm.studyYearStartYear)
          : getSpringSemesterCode(t.studyTerm.studyYearStartYear)

      return {
        date: t.registrationDate,
        type: t.termRegistrationType,
        semester_code,
      }
    }
    return {
      studyright: studyright.studyRightId,
      terms: studyright.termRegistrations
        .map(t => innerMangel(t))
        .sort((c1, c2) => c2.semester_code - c1.semester_code),
    }
  }

  res.status(200).send(termRegistrations.map(studyright => mangel(studyright)).filter(s => s.terms.length > 0))
})

router.get('/:studentNumber/has_passed_course/:code', async (req, res) => {
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
})

/**
 * Check how many credits student obtained during a specific academic year.
 * @startYear Example: 2020, means whole 2020 academic year.
 */
router.get('/:studentNumber/fuksi_year_credits/:startYear', async (req, res) => {
  const { startYear } = req.params
  if (!startYear) return res.status(403).send('StartYear required')

  // Dont have this data:
  // const semesterInfo = await models.StudyYear.findOne({
  //   where: {
  //     startYear: startYear,
  //   },
  // })

  const semesterStart = new Date(`${startYear}-08-01`)
  const semesterEnd = new Date(`${parseInt(startYear) + 1}-08-01`)

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
})

/**
 * Checks if student with @studentNumber has enrolled for a course, under organisation @studyTrackId
 * organisation example; organisation: { code: '570-K001', name: { fi: 'Biologian kandiohjelma' } }
 */
router.get('/:studentNumber/enrolled/study_track/:studyTrackId', async (req, res) => {
  const { studyTrackId } = req.params
  if (!studyTrackId) return res.status(403).send('StudyTrackId required')

  const enrolledCourses = await models.Enrolment.findAll({
    where: {
      personId: req.student.id,
      state: 'ENROLLED',
    },
    include: [{ model: CourseUnitRealisation, as: 'courseUnitRealisation' }],
  })

  for (const { courseUnitRealisation } of enrolledCourses) {
    if (!courseUnitRealisation || !courseUnitRealisation.organisations) continue
    const organisationIds = courseUnitRealisation.organisations.map(e => e.organisationId)

    const responsibleOrganisations = await models.Organisation.findAll({
      where: {
        id: {
          [Op.in]: organisationIds,
        },
      },
    })

    const organisationIsValid = responsibleOrganisations.map(({ code }) => code).includes(studyTrackId)
    const registrationIsActive = new Date(courseUnitRealisation.activityPeriod.endDate).getTime() > new Date().getTime()

    if (organisationIsValid && registrationIsActive) return res.send(true)
  }

  return res.send(false)
})

router.get('/:studentNumber/course-unit/:courseCode/enrolments', async (req, res) => {
  const { courseCode: code } = req.params
  const courseUnits = await models.CourseUnit.findAll({
    where: { code },
    attributes: ['id'],
    raw: true,
  })
  const enrollments = await models.Enrolment.findAll({
    where: {
      personId: req.student.id,
      state: 'ENROLLED',
      courseUnitId: {
        [Op.in]: courseUnits.map(({ id }) => id),
      },
    },
    raw: true,
  })
  return res.send(enrollments)
})

router.get('/:studentNumber/course-unit/:courseCode/attainments', async (req, res) => {
  const { courseCode: code } = req.params
  const courseUnits = await models.CourseUnit.findAll({
    where: { code },
    attributes: ['id'],
    raw: true,
  })
  const attainments = await models.Attainment.findAll({
    where: {
      personId: req.student.id,
      courseUnitId: courseUnits.map(({ id }) => id),
    },
    raw: true,
  })
  return res.send(attainments)
})

router.get('/:studentNumber/attainments', async (req, res) => {
  const attainments = await models.Attainment.findAll({
    where: {
      personId: req.student.id,
    },
    include: [
      { model: CourseUnit, as: 'courseUnit' },
      { model: CourseUnitRealisation, as: 'courseUnitRealisation' },
    ],
    raw: true,
    nest: true,
  })
  return res.send(attainments)
})

router.get('/:studentNumber/enrollments', async (req, res) => {
  const enrollments = await models.Enrolment.findAll({
    where: {
      personId: req.student.id,
    },
    include: [
      { model: CourseUnit, as: 'courseUnit' },
      { model: CourseUnitRealisation, as: 'courseUnitRealisation' },
    ],
    raw: true,
    nest: true,
  })
  return res.send(enrollments)
})

router.get('/:studentNumber/disclosures', async (req, res) => {
  const disclosures = await Disclosure.findAll({
    where: {
      personId: req.student.id,
    },
  })

  return res.send(disclosures)
})

router.get('/:studentNumber/details', (req, res) => {
  const { firstNames, lastName, eduPersonPrincipalName, primaryEmail, dead, secondaryEmail, preferredLanguageUrn } =
    req.student
  res.send({ firstNames, lastName, eduPersonPrincipalName, primaryEmail, dead, secondaryEmail, preferredLanguageUrn })
})

module.exports = router
