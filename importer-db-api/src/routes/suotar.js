const router = require('express').Router()
const axios = require('axios').default
const { Op } = require('sequelize')
const models = require('../models')
const fs = require('fs')
const https = require('https')

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
    if (!Array.isArray(data))
      return res.status(400).send({ error: 'Input should be an array' })

    const persons = await models.Person.findAll({
      where: {
        studentNumber: { [Op.in]: data.map(({ studentNumber }) => studentNumber) }
      },
      raw: true
    })
    const gradeScales = await models.GradeScale.findAll({ raw: true })


    const output = []
    for (const { studentNumber, courseCode } of data) {
      const person = persons.find(p => p.studentNumber === studentNumber)
      if (!person) {
        output.push({ studentNumber, courseCode, attainments: [] })
        continue
      }
      const courseUnits = await getCourseUnits(courseCode)
      const allAttainments = await models.Attainment.findAll({
        where: {
          courseUnitId: {
            [Op.in]: courseUnits.map(({ id }) => id)
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
 */
router.get('/attainments/:courseCode/:studentNumber', async (req, res) => {
  const { courseCode: code, studentNumber } = req.params

  if (!code || !studentNumber) return res.status(400).send('Missing course code or student number')

  const { id: personId } = await models.Person.findOne({
    where: {
      studentNumber
    },
    attributes: ['id'],
    raw: true
  })

  if (!personId) return res.status(400).send(`No person found with student number ${studentNumber}`)

  const allCourseUnits = await getCourseUnits(code)

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

const findGrade = (gradeScales, gradeScaleId, gradeId) => gradeScales
  .find(({ id }) => id === gradeScaleId).grades
  .find(({ localId }) => localId === String(gradeId))


/**
 * Get course units and substitutions by course code
 */
const getCourseUnits = async (code) => {
  const courseUnit = await models.CourseUnit.findOne({
    where: { code },
    attributes: ['groupId', 'substitutions'],
    raw: true
  })
  if (!courseUnit) return []

  const groupIds = [courseUnit.groupId].concat(courseUnit.substitutions.map(sub => sub[0].courseUnitGroupId))
  return await models.CourseUnit.findAll({
    where: {
      groupId: {
        [Op.in]: groupIds
      },
    },
    raw: true
  }) || []
}

module.exports = router
