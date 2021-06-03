const router = require('express').Router()
const axios = require('axios').default
const { Op } = require('sequelize')
const models = require('../models')
const fs = require('fs')
const https = require('https')
const _ = require('lodash')

const { SIS_API_URL, PROXY_TOKEN, KEY_PATH, CERT_PATH, API_KEY } = process.env

const hasCerts = KEY_PATH && CERT_PATH

const getHeaders = () => {
  if (!hasCerts) return { token: PROXY_TOKEN || '' }
  else if (hasCerts && API_KEY) return { 'X-Api-Key': API_KEY }
  return {}
}

const agent = hasCerts
  ? new https.Agent({
    cert: fs.readFileSync(CERT_PATH, 'utf8'),
    key: fs.readFileSync(KEY_PATH, 'utf8')
  })
  : new https.Agent()

const sisApi = axios.create({
  baseURL: SIS_API_URL,
  headers: getHeaders(),
  httpsAgent: agent
})

/**
 * Send assessments to Sisu
 */
router.post('/', async (req, res) => {
  try {
    const { body } = req
    const resp = await sisApi.post('/hy-custom/assessments/send/kurki', body)
    return res.status(200).json(resp.data)
  } catch (e) {
    console.log(e)
    console.log(JSON.stringify(e.response.data))
    res.status(500).json(e.response.data)
  }
})

/**
 * Post list of {courseCode, studentNumber} pairs here to get their attainments
 */
router.post('/attainments', async (req, res) => {
  try {
    const data = req.body
    const { noSubstitutions } = req.query

    if (!Array.isArray(data))
      return res.status(400).send({ error: 'Input should be an array' })

    const persons = await models.Person.findAll({
      where: {
        studentNumber: { [Op.in]: data.map(({ studentNumber }) => studentNumber) }
      },
      raw: true
    })
    const gradeScales = await models.GradeScale.findAll({ raw: true })
    const allCourseUnits = await getAllCourseUnits(data.map(({ courseCode }) => courseCode), !!noSubstitutions)

    const output = []
    for (const { studentNumber, courseCode } of data) {
      const person = persons.find(p => p.studentNumber === studentNumber)
      if (!person || !allCourseUnits[courseCode]) {
        output.push({ studentNumber, courseCode, attainments: [] })
        continue
      }
      const allAttainments = await models.Attainment.findAll({
        where: {
          courseUnitId: {
            [Op.in]: allCourseUnits[courseCode].map(({ id }) => id)
          },
          personId: person.id
        },
        raw: true
      })
      const attainmentsWithGrade = allAttainments.map(attainment => ({
        ...attainment,
        grade: findGrade(gradeScales, attainment.gradeScaleId, attainment.gradeId)
      }))

      output.push({
        studentNumber,
        courseCode,
        attainments: attainmentsWithGrade
      })
    }
    return res.send(output)
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

/**
 * Get all attainments by course code and student number, including attainments
 * from substitutions for given course.
 *
 * Use req param noSubstitutions=true to include attainments for the course code only.
 */
router.get('/attainments/:courseCode/:studentNumber', async (req, res) => {
  const { courseCode: code, studentNumber } = req.params
  const { noSubstitutions } = req.query

  if (!code || !studentNumber) return res.status(400).send('Missing course code or student number')

  const { id: personId } = await models.Person.findOne({
    where: {
      studentNumber
    },
    attributes: ['id'],
    raw: true
  })

  if (!personId) return res.status(400).send(`No person found with student number ${studentNumber}`)

  const allCourseUnits = await getCourseUnits(code, !!noSubstitutions)

  const allAttainments = await models.Attainment.findAll({
    where: {
      courseUnitId: {
        [Op.in]: allCourseUnits.map(({ id }) => id)
      },
      personId
    },
    raw: true
  })

  const gradeScales = await models.GradeScale.findAll({ raw: true })

  const data = allAttainments.map(attainment => ({
    ...attainment,
    grade: findGrade(gradeScales, attainment.gradeScaleId, attainment.gradeId)
  }))

  return res.send(data)
})

/**
 * Post array of {personId, courseUnitId, courseUnitRealisationId, assessmentItemId, gradeId} attainments. This endpoint
 * will return the data with additional field called registered with true/false is the attainment found from Sisu.
 *
 * Performance of this is still WIP...
 */
router.post('/verify', async (req, res) => {
  try {
    const data = req.body
    if (!Array.isArray(data))
      return res.status(400).send({ error: 'Input should be an array' })

    const attainments = await models.Attainment.findAll({
      where: {
        personId: { [Op.in]: data.map(({ personId }) => personId) }
      }
    })

    const output = data.map(entry => {
      const isRegistered = attainments.find(attainment => (
        attainment.personId === entry.personId &&
        attainment.courseUnitId === entry.courseUnitId &&
        attainment.courseUnitRealisationId === entry.courseUnitRealisationId &&
        attainment.gradeId === parseInt(entry.gradeId) &&
        attainment.assessmentItemId === entry.assessmentItemId
      ))
      return { ...entry, registered: !!isRegistered }
    })
    return res.send(output)
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

/**
 * Get all enrolments for given person and course code. All enrolments are enriched with
 * course unit realisation data of the enrolment.
 * Post list of {personId, code} objects.
 */
router.post('/enrolments', async (req, res) => {
  try {
    const data = req.body
    if (!Array.isArray(data))
      return res.status(400).send({ error: 'Input should be an array' })


    const output = await Promise.all(data.map(async ({ code, personId }) => {
      if (!code || !personId)
        return null
      const courseUnits = await models.CourseUnit.findAll({
        where: { code },
        raw: true
      })
      const enrolments = await models.Enrolment.findAll({
        where: {
          courseUnitId: { [Op.in]: courseUnits.map(({ id }) => id) },
          personId
        },
        raw: true
      })
      const enrolmentsWithRealisations = await Promise.all(enrolments.map(async (enrolment) => ({
        ...enrolment,
        courseUnitRealisation: await models.CourseUnitRealisation.findOne({
          where: { id: enrolment.courseUnitRealisationId },
          raw: true
        }),
        courseUnit: courseUnits.find(({ id }) => id === enrolment.courseUnitId)
      })))
      return { code, personId, enrolments: enrolmentsWithRealisations }
    }))
    // Filter out possible nulls
    res.send(output.filter(e => !!e))
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

router.post('/acceptors', async (req, res) => {
  try {
    const data = req.body
    if (!Array.isArray(data))
      return res.status(400).send({ error: 'Input should be an array' })
    const realisations = await models.CourseUnitRealisation.findAll({
      where: { id: { [Op.in]: data } },
      raw: true
    })
    if (!realisations.length)
      return res.status(404).send('Realisation not found')

    const acceptors = realisations.reduce((acc, { id, responsibilityInfos }) => {
      acc[id] = responsibilityInfos
        .filter(({ roleUrn }) => (
          roleUrn === 'urn:code:course-unit-realisation-responsibility-info-type:teacher' ||
          roleUrn === 'urn:code:course-unit-realisation-responsibility-info-type:responsible-teacher')
        )
        .map(({ personId }) => ({
          roleUrn: 'urn:code:attainment-acceptor-type:approved-by',
          personId
        }))
      return acc
    }, {})
    return res.send(acceptors)
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

router.post('/resolve_user', async (req, res) => {
  try {
    const { email, employeeId, uid } = req.body
    const filters = {}
    if (email) filters.primaryEmail = email
    if (employeeId) filters.employeeNumber = employeeId
    if (uid) filters.eduPersonPrincipalName = `${uid}@helsinki.fi`
    const user = await models.Person.findOne({ where: filters, raw: true })
    if (!user) return res.send({})
    const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
      attributes: ['assessmentItemIds'],
      where: {
        responsibilityInfos: {
          [Op.contains]: [{ personId: user.id }],
        },
        courseUnitRealisationTypeUrn: { [Op.iLike]: 'urn:code:course-unit-realisation-type:teaching-participation-%' }
      },
      raw: true
    })

    const assessmentItemIds = _.uniq(courseUnitRealisations.map(cur => cur.assessmentItemIds).flat())

    const assessmentItems = await models.AssessmentItem.findAll({
      where: {
        id: { [Op.in]: assessmentItemIds }
      },
      include: [{
        model: models.CourseUnit,
        as: 'courseUnit'
      }],
      raw: true
    })
    const codes = _.uniq(assessmentItems.map(a => a["courseUnit.code"]))

    return res.send({ ...user, courses: codes })
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

router.get('/responsibles/:courseCode', async (req, res) => {
  const { courseCode: code } = req.params
  if (!code) return res.status(400).send("Missing course code")

  const courseUnits = await models.CourseUnit.findAll({ where: { code }, attributes: ['groupId'] })
  const groupIds = _.uniq(courseUnits.map(({ groupId }) => groupId))
  const assessmentItems = await models.AssessmentItem.findAll({
    where: {
      primaryCourseUnitGroupId: { [Op.in]: groupIds }
    },
    attributes: ['id']
  })
  const courseUnitRealisations = await models.CourseUnitRealisation
    .scope([
      { method: ['assessmentItemIdsOverlap', assessmentItems.map(({ id }) => id)] }
    ])
    .findAll({ raw: true, attributes: ['responsibilityInfos'] })

  const persons = await models.Person.findAll({
    where: {
      id: { [Op.in]: _.uniq(courseUnitRealisations.map(({ responsibilityInfos }) => responsibilityInfos.map(r => r.personId)).flat()) }
    }
  })
  const personsById = persons.reduce((acc, p) => {
    acc[p.id] = p
    return acc
  }, {})

  const personsWithRoles = courseUnitRealisations.reduce((acc, r) => {
    for (const role of r.responsibilityInfos) {
      if (!acc[role.personId]) {
        acc[role.personId] = { person: personsById[role.personId], roles: [role.roleUrn] }
        continue
      }
      acc[role.personId].roles.push(role.roleUrn)
      acc[role.personId].roles = _.uniq(acc[role.personId].roles)
    }
    return acc
  }, {})

  return res.send(personsWithRoles)
})

router.post('/substitutions', async (req, res) => {
  try {
    const codes = req.body
    if (!Array.isArray(codes))
      return res.status(400).send({ error: 'Input should be an array' })
    const courseUnits = await getAllCourseUnits(codes)
    return res.send(codes.reduce((acc, code) => {
      acc[code] = [...new Set(courseUnits[code].map(c => c.code))]
      return acc
    }, {}))
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

const findGrade = (gradeScales, gradeScaleId, gradeId) => gradeScales
  .find(({ id }) => id === gradeScaleId).grades
  .find(({ localId }) => localId === String(gradeId))


/**
 * Get course units and substitutions by course code
 */
const getCourseUnits = async (code, noSubstitutions = false) => {
  const courseUnits = await models.CourseUnit.findAll({
    where: { code },
    attributes: ['groupId', 'substitutions'],
    raw: true
  })
  if (!courseUnits.length) return []

  if (noSubstitutions) return courseUnits

  const groupIds = [... new Set(courseUnits
    .map(c => c.groupId)
    .concat(courseUnits
      .map(c => c.substitutions
        .map(sub => sub[0].courseUnitGroupId)
      )
    )
    .flat())]
  return await models.CourseUnit.findAll({
    where: {
      groupId: {
        [Op.in]: groupIds
      },
    },
    raw: true
  }) || []
}

/**
 * Get course units and substitutions by course codes.
 * Output: {courseCode: [courseUnits]}
 */
const getAllCourseUnits = async (codes, noSubstitutions = false) => {
  const courseUnits = await models.CourseUnit.findAll({
    where: { code: { [Op.in]: codes } },
    attributes: ['groupId', 'substitutions', 'code'],
    raw: true
  })
  if (!courseUnits.length) return []
  if (noSubstitutions) return courseUnits.reduce((acc, cUnit) => {
    acc[cUnit.code] = courseUnits.filter(c => c.code === cUnit.code)
    return acc
  }, {})

  // All group ids, including substitutions
  const groupIds = [... new Set(courseUnits
    .map(c => c.groupId)
    .concat(courseUnits
      .map(c => c.substitutions
        .map(sub => sub[0].courseUnitGroupId)
      )
    )
    .flat())]

  // All course units
  const withSubs = await models.CourseUnit.findAll({
    where: {
      groupId: {
        [Op.in]: groupIds
      },
    },
    raw: true
  }) || []

  // Group ids, including substitutions  by course code
  const gIdsByCode = withSubs.reduce((acc, cUnit, i, array) => {
    acc[cUnit.code] = [cUnit.groupId].concat(courseUnits
      .map(c => c.substitutions
        .map(sub => sub[0].courseUnitGroupId)
      ))
      .flat()
    return acc
  }, {})

  return withSubs.reduce((acc, cUnit, i, arr) => {
    acc[cUnit.code] = arr.filter(c => gIdsByCode[cUnit.code].includes(c.groupId))
    return acc
  }, {})
}

module.exports = router
