const { Op } = require('sequelize')
const express = require('express')
const models = require('../../models')

const { addMonths } = require('date-fns')
const { relevantAttributes } = require('./config')

const router = express.Router()

const apparaattiRouter = express.Router()

const addCourseUnitsToRealisations = async courseUnitRealisations => {
  const assessmentItemIds = courseUnitRealisations.flatMap(c => c.assessmentItemIds)

  const assessmentItemsWithCrap = await models.AssessmentItem.findAll({
    attributes: relevantAttributes.assessmentItem,
    where: {
      id: {
        [Op.in]: assessmentItemIds
      }
    },
    include: [
      {
        model: models.CourseUnit,
        attributes: relevantAttributes.courseUnit.concat(['credits']),
        as: 'courseUnit',
        required: true
      }
    ]
  })

  const allOrganisationIds = assessmentItemsWithCrap.flatMap(assessmentItem =>
    assessmentItem.organisations.map(org => org.organisationId)
  )

  const allOrganisations = await models.Organisation.findAll({
    attributes: ['name', 'id', 'code'],
    where: {
      id: allOrganisationIds
    }
  })

  const assessmentItems = assessmentItemsWithCrap.filter(aItem =>
    aItem?.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))
  )

  const findOrgByAssessmentItem = assessmentItem =>
    assessmentItem.organisations.map(org =>
      allOrganisations.find(organisation => organisation.id === org.organisationId)
    )

  const realisationsWithCourseUnits = courseUnitRealisations.map(aRealisation => {
    const realisation = aRealisation.get({ plain: true })

    const courseUnits = assessmentItems
      .filter(assessmentItem => realisation.assessmentItemIds.includes(assessmentItem.id))
      .map(assessmentItem => {
        const courseUnit = assessmentItem.get({ plain: true }).courseUnit
        const organisations = findOrgByAssessmentItem(assessmentItem)
        delete courseUnit.completionMethods
        return { ...courseUnit, organisations }
      })

    return {
      ...realisation,
      courseUnits
    }
  })

  return realisationsWithCourseUnits
}

router.get('/courses', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const courseStartTreshold = addMonths(new Date(), 48)

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation.concat(['customCodeUrns']),
    limit,
    offset,
    where: {
      [Op.and]: [
        {
          'activityPeriod.endDate': {
            [Op.gte]: new Date()
          }
        },
        {
          'activityPeriod.startDate': {
            [Op.lte]: courseStartTreshold
          }
        }
      ]
    }
  })

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits)
})

apparaattiRouter.get('/enrolments-new', async (req, res) => {
  const { since: sinceRaw, limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const since = new Date(sinceRaw)

  if (!sinceRaw || since === 'Invalid Date') {
    return res.status(400).send({ message: 'Missing or invalid query parameter since' })
  }

  const enrolments = await models.Enrolment.findAll({
    limit,
    offset,
    where: {
      state: 'ENROLLED',
      enrolmentDateTime: {
        [Op.gte]: since
      }
    },
    attributes: relevantAttributes.enrolments,
    order: [['id', 'DESC']]
  })

  res.send(enrolments)
})

apparaattiRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const persons = await models.Person.findAll({
    attributes: relevantAttributes.persons,
    order: [['id', 'DESC']],
    limit,
    offset
  })

  res.send(persons)
})

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
    return { education: 'is missing from the database' }
  }
}

// drops certain fields based on includeOpenUni and includeDeleted
const mankeloiStudyRights = async (studyRights, includeOpenUni, includeDeleted) => {
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

  return mankeledStudyRights
}

apparaattiRouter.get('/studyrights', async (req, res) => {
  try {
    const { limit, offset } = req.query
    if (!limit || !offset) return res.sendStatus(400)
    const { openUni: includeOpenUni, deleted: includeDeleted } = req.query

    const studyRights = await models.StudyRight.findAll({
      limit,
      offset,
      raw: true
    })
    if (!studyRights.length) return []

    const mankeledStudyRights = await mankeloiStudyRights(studyRights, includeOpenUni, includeDeleted)
    return res.json(mankeledStudyRights)
  } catch (e) {
    res.status(500).json(e.toString())
  }
})

//this is partially taken from archeology.js
apparaattiRouter.get('/:studentNumber/studyrights', async (req, res) => {
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
    res.status(500).json(e.toString())
  }
})

apparaattiRouter.get('/organisations', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const organisations = await models.Organisation.findAll({
    attributes: relevantAttributes.organisation,
    where: {
      [Op.and]: [
        // Only latest snapshot
        models.Organisation.sequelize.literal(
          '(code, snapshot_date_time) in (select code, max(snapshot_date_time) from organisations group by code)'
        )
      ]
    },
    limit,
    offset,
    order: [['id', 'DESC']]
  })

  res.send(organisations)
})

router.use('/', apparaattiRouter)

module.exports = router
