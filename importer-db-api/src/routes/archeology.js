const router = require('express').Router()
const models = require('../models')
const { Op, QueryTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const logger = require('../utils/logger')

const getEducationByIdForStudyright = async id => {
  try {
    const education = await models.Education.findOne({
      where: { id },
      raw: true
    })

    delete education.organisations
    delete education.responsibilityInfos
    delete education.universityOrgIds
    delete education.attainmentLanguages
    delete education.studyFields
    if (education.structure && education.structure.phase1)
      education.structure.phase1 = { name: education.structure.phase1.name }
    if (education.structure && education.structure.phase2)
      education.structure.phase2 = { name: education.structure.phase2.name }
    if (education.structure && education.structure.learningOpportunities)
      delete education.structure.learningOpportunities

    return education
  } catch (err) {
    logger.error(err)
    return { education: 'is missing from the database' }
  }
}

router.get('/:studentNumber/studyrights', async (req, res) => {
  try {
    const student = await models.Person.findOne({
      where: {
        studentNumber: req.params.studentNumber
      }
    })

    const { openUni: includeOpenUni } = req.query
    const { deleted: includeDeleted } = req.query

    if (!student) return res.status(404).send('Student not found')

    const studyRights = await models.StudyRight.findAll({
      where: { personId: student.id },
      order: [['modificationOrdinal', 'DESC']],
      raw: true
    })
    if (!studyRights.length) return res.json([])

    const mankeledStudyRights = []
    for (const studyRight of studyRights) {
      const { educationPhase1GroupId, educationPhase2GroupId } = studyRight.acceptedSelectionPath || {}

      const education = await getEducationByIdForStudyright(studyRight.educationId)

      if (!includeDeleted && studyRight.documentState === 'DELETED') continue
      if (!includeOpenUni && education?.educationType?.includes('open-university-studies')) continue

      const additionalData = { education }

      if (educationPhase1GroupId) {
        const educationPhase1 = await models.Module.findOne({
          where: { groupId: educationPhase1GroupId },
          raw: true
        })
        if (educationPhase1) {
          delete educationPhase1.responsibilityInfos
          delete educationPhase1.organisations
          delete educationPhase1.universityOrgIds
          delete educationPhase1.curriculumPeriodIds
          delete educationPhase1.studyFields
          delete educationPhase1.rule
        }
        additionalData.educationPhase1 = educationPhase1
      }
      if (educationPhase2GroupId) {
        const educationPhase2 = await models.Module.findOne({
          where: { groupId: educationPhase2GroupId },
          raw: true
        })
        if (educationPhase2) {
          delete educationPhase2.responsibilityInfos
          delete educationPhase2.organisations
          delete educationPhase2.universityOrgIds
          delete educationPhase2.curriculumPeriodIds
          delete educationPhase2.studyFields
          delete educationPhase2.rule
        }
        additionalData.educationPhase2 = educationPhase2
      }
      mankeledStudyRights.push({ ...studyRight, ...additionalData })
    }
    return res.json(mankeledStudyRights)
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

// Probably CPU usage > inf
router.get('/assessments', async (req, res) => {
  try {
    const courseUnits = await models.CourseUnit.findAll({
      where: {
        code: { [Op.iLike]: '%TKT%' }
      },
      raw: true
    })
    const assessmentItems = await models.AssessmentItem.findAll({
      where: {
        primaryCourseUnitGroupId: {
          [Op.in]: courseUnits.map(({ groupId }) => groupId)
        }
      },
      raw: true
    })
    const realisations = await models.CourseUnitRealisation.findAll({
      where: {
        assessmentItemIds: {
          [Op.overlap]: assessmentItems.map(({ id }) => id)
        }
      },
      raw: true
    })
    logger.info(`GOT ${realisations.length} realisations`)
    const wat = realisations.filter(r => r.assessmentItemIds.length > 1)
    return res.send(wat)
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

router.get('/:studentNumber/attainments', async (req, res) => {
  try {
    const student = await models.Person.findOne({
      where: {
        studentNumber: req.params.studentNumber
      }
    })

    if (!student) return res.status(404).send('Student not found')

    const attainments = await models.Attainment.findAll({
      where: {
        personId: student.id
      },
      raw: true
    })

    const attainmentsWithCourses = await Promise.all(
      attainments.map(async a => {
        const courseUnit = await models.CourseUnit.findOne({
          where: {
            id: a.courseUnitId
          }
        })
        return Promise.resolve({ ...a, courseUnit })
      })
    )

    if (req.query.code)
      return res.send(attainmentsWithCourses.filter(a => a.courseUnit && a.courseUnit.code.includes(req.query.code)))
    return res.send(attainmentsWithCourses)
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

router.get('/:studentNumber/enrollments', async (req, res) => {
  try {
    const student = await models.Person.findOne({
      where: {
        studentNumber: req.params.studentNumber
      }
    })
    if (!student) return res.status(404).send('Student not found')

    const enrolments = await models.Enrolment.findAll({
      where: {
        personId: student.id,
        state: 'ENROLLED'
      },
      order: [['enrolmentDateTime', 'DESC']],
      limit: req.query.limit || null,
      raw: true
    })

    const mankeled = await Promise.all(
      enrolments.map(async e => {
        const assessmentItem = await models.AssessmentItem.findOne({ where: { id: e.assessmentItemId } })
        const courseUnit = await models.CourseUnit.findOne({ where: { id: e.courseUnitId } })
        const courseUnitRealisation = await models.CourseUnitRealisation.findOne({
          where: { id: e.courseUnitRealisationId }
        })
        return Promise.resolve({ ...e, assessmentItem, courseUnit, courseUnitRealisation })
      })
    )
    return res.send(mankeled)
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

router.get('/assessments/:code', async (req, res) => {
  try {
    const courseUnit = await models.CourseUnit.findOne({
      where: {
        code: req.params.code
      },
      raw: true
    })
    if (!courseUnit) return res.status(404).send('Course not found')

    const assessmentItems = await models.AssessmentItem.findAll({
      where: { primaryCourseUnitGroupId: courseUnit.groupId },
      raw: true
    })
    return res.send({ courseUnit, assessmentItems })
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

// ???
const cache = {}

router.get('/:studentNumber/missing', async (req, res) => {
  try {
    const student = await models.Person.findOne({
      where: {
        studentNumber: req.params.studentNumber
      }
    })
    if (!student) return res.status(404).send('Student not found')

    if (cache[student.id]) {
      logger.info('Data from cache')
      return res.send(cache[student.id])
    }

    const data = await sequelize.query(
      `SELECT * FROM attainments
            WHERE attainments.type = 'CourseUnitAttainment'
                AND attainments.person_id = '${student.id}'
                AND NOT EXISTS (SELECT 1 FROM course_units where course_units.id = attainments.course_unit_id)
            `,
      { type: QueryTypes.SELECT }
    )

    cache[student.id] = data
    return res.send(data)
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

router.post('/missing', async (req, res) => {
  try {
    const reqData = req.body
    if (!Array.isArray(reqData)) return res.status(400).send({ error: 'Input should be an array' })
    const persons = await models.Person.findAll({
      where: {
        studentNumber: { [Op.in]: reqData.map(studentNumber => studentNumber) }
      },
      raw: true
    })
    if (!persons.length) return res.status(404).send('Students not found')

    const allPersonIds = persons.map(({ id }) => id)
    const output = Object.keys(cache)
      .filter(key => allPersonIds.includes(key))
      .map(key => cache[key])
      .flat(1)
    logger.info(`From cache ${output.length} items`)

    const notCachedStudents = persons.filter(({ id }) => !(id in cache))
    const listOfStudents = notCachedStudents.map(({ id }) => `'${id}'`).join(', ')
    if (!listOfStudents) return res.send(output)
    const data = await sequelize.query(
      `SELECT * FROM attainments
            WHERE attainments.type = 'CourseUnitAttainment'
                AND attainments.person_id IN (${listOfStudents})
                AND NOT EXISTS (SELECT 1 FROM course_units where course_units.id = attainments.course_unit_id)
            `,
      { type: QueryTypes.SELECT }
    )

    // Hecking O(n^inf) way to do cache
    notCachedStudents.forEach(person => {
      const allAttainments = data.filter(attainment => attainment.person_id === person.id)
      cache[person.id] = allAttainments
    })
    return res.send(output.concat(data))
  } catch (e) {
    logger.error(e)
    res.status(500).json(e.toString())
  }
})

// Massive CPU and memory usage here
// ⊂(◉‿◉)つ
router.get('/possibleCoursesWithPartAttainments', async (req, res) => {
  const courseUnits = await sequelize.query(
    `
  SELECT c_units.code, c_units.name, c_units.completion_methods, c_units.group_id, sub.id_max as id
    FROM (
        SELECT code, MAX(id) AS id_max
        FROM course_units
        GROUP BY code
    ) sub
    JOIN course_units c_units ON c_units.code = sub.code AND sub.id_max = c_units.id
  `,
    {
      mapToModel: true,
      model: models.CourseUnit,
      raw: true
    }
  )

  // hy-CM-117766481 <-- IT'S A MATCH!
  // hy-CM-117766481-default-teaching-participation <-- NO GOOD
  const re = /hy-CM-(\d*)$/

  const output = courseUnits
    .filter(courseUnit => {
      const theMethod = courseUnit.completionMethods.find(m => !!re.exec(m.localId))
      if (!theMethod) return false
      return theMethod.assessmentItemIds.length > 1
    })
    .map(courseUnit => ({
      ...courseUnit,
      completionMethods: courseUnit.completionMethods.find(m => !!re.exec(m.localId))
    }))
  logger.info('TOTAL', output.length)
  return res.send(output)
})

// Archeology monster
// 	༼ ༎ຶ ෴ ༎ຶ༽
router.get('/assessmentItemsFromCoursesWithPartAttainments', async (req, res) => {
  const courseUnits = await sequelize.query(
    `
  SELECT c_units.code, c_units.name, c_units.completion_methods, sub.id_max as id
    FROM (
        SELECT code, MAX(id) AS id_max
        FROM course_units
        GROUP BY code
    ) sub
    JOIN course_units c_units ON c_units.code = sub.code AND sub.id_max = c_units.id
  `,
    {
      mapToModel: true,
      model: models.CourseUnit,
      raw: true
    }
  )

  // hy-CM-117766481 <-- IT'S A MATCH!
  // hy-CM-117766481-default-teaching-participation <-- NO GOOD
  const re = /hy-CM-(\d*)$/

  const assessmentItemIds = [
    ...new Set(
      courseUnits
        .filter(courseUnit => {
          const theMethod = courseUnit.completionMethods.find(m => !!re.exec(m.localId))
          if (!theMethod) return false
          return theMethod.assessmentItemIds.length > 1
        })
        .map(courseUnit => ({
          ...courseUnit,
          completionMethods: courseUnit.completionMethods.find(m => !!re.exec(m.localId))
        }))
        .map(c => c.completionMethods.assessmentItemIds)
        .flat()
    )
  ]

  const output = await models.AssessmentItem.findAll({
    where: { id: { [Op.in]: assessmentItemIds } },
    attributes: ['name', 'credits', 'id', 'primaryCourseUnitGroupId'],
    raw: true
  })
  return res.send(output)
})

router.post('/courseUnitsAndRealisations', async (req, res) => {
  const out = {}
  await Promise.all(
    req.body.map(async code => {
      logger.info('WHAT', code)
      const courseUnits = await models.CourseUnit.findAll({
        where: { code },
        attributes: ['groupId', 'id'],
        raw: true
      })
      const aItems = await models.AssessmentItem.findAll({
        where: { primaryCourseUnitGroupId: { [Op.in]: courseUnits.map(c => c.groupId) } },
        attributes: ['id'],
        raw: true
      })
      const reals = await models.CourseUnitRealisation.findAll({
        where: { assessmentItemIds: { [Op.overlap]: aItems.map(a => a.id) } },
        attributes: ['id', 'name', 'activityPeriod', 'courseUnitRealisationTypeUrn']
      })
      out[code] = {
        courseUnits: courseUnits.map(c => c.id),
        realsisations: reals.map(
          r =>
            `${r.id} - ${r.courseUnitRealisationTypeUrn.split(':')[3]} - ${r.name.fi || r.name.en} - ${
              r.activityPeriod.startDate
            } - ${r.activityPeriod.endDate}`
        )
      }
      return Promise.resolve()
    })
  )
  res.send(out)
})

router.get('/:studentNumber/plans', async (req, res) => {
  const student = await models.Person.findOne({
    where: {
      studentNumber: req.params.studentNumber
    }
  })

  if (!student) return res.status(404).send('Student not found')

  const plans = await models.Plan.findAll({
    where: { userId: student.id },
    raw: true
  })

  res.send(plans)
})

router.get('/:personId/person-groups', async (req, res) => {
  const { personId } = req.params

  if (!personId) return res.status(404).send('plz gibe person id')

  const plans = await models.PersonGroup.findAll()

  res.send(plans.filter(p => p.responsibilityInfos.some(r => r.personId === personId)))
})

router.get('/wat', async (req, res) => {
  const curs = await models.CourseUnitRealisation.findAll({ attributes: ['id', 'organisations'], raw: true })
  const w = curs.reduce((acc, cur) => {
    const o = cur.organisations.find(o => o.roleUrn === 'urn:code:organisation-role:coordinating-organisation')
    if (o) {
      acc[o.organisationId] = (acc[o.organisationId] || 0) + 1
    }
    return acc
  }, {})
  res.send(w)
})

module.exports = router
