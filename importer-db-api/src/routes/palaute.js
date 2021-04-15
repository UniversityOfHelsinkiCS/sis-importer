const { Op } = require('sequelize')
const express = require('express')
const models = require('../models')

const relevantAttributes = {
  enrolment: ['id', 'personId', 'assessmentItemId', 'courseUnitRealisationId', 'courseUnitId', 'studySubGroups'],
  courseUnit: ['id', 'groupId', 'code', 'organisations', 'completionMethods', 'responsibilityInfos', 'name'],
  courseUnitRealisation: [
    'id',
    'name',
    'nameSpecifier',
    'assessmentItemIds',
    'activityPeriod',
    'courseUnitRealisationTypeUrn',
    'studyGroupSets',
    'organisations',
    'responsibilityInfos',
  ],
  assessmentItem: ['id', 'name', 'nameSpecifier', 'assessmentItemType', 'organisations', 'primaryCourseUnitGroupId'],
  person: ['id', 'studentNumber', 'eduPersonPrincipalName', 'firstNames', 'lastName'],
}


const addRealisationsToCourseUnits = async (courseUnitRealisations) => {
  const assessmentItemIds = [].concat(...courseUnitRealisations.map(c => c.assessmentItemIds))

  const assessmentItemsWithCrap = await models.AssessmentItem.findAll({
    attributes: relevantAttributes.assessmentItem,
    where: {
      id: {
        [Op.in]: assessmentItemIds,
      },
    },
    include: [
      {
        model: models.CourseUnit,
        attributes: relevantAttributes.courseUnit,
        as: 'courseUnit',
      },
    ],
  })

  const assessmentItems = assessmentItemsWithCrap.filter(aItem => {
    if (aItem.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))) return true

    return false
  })

  const realisationsWithCourseUnits = courseUnitRealisations.map(r => {
    const realisation = r.get({ plain: true })
    return {
      ...realisation,
      courseUnits: [].concat(...realisation.assessmentItemIds.map(aId => assessmentItems.filter(aItem => aItem.id === aId).map(aItem => {
        const courseUnit = aItem.get({ plain: true }).courseUnit
        delete courseUnit.completionMethods
        return courseUnit
      })))
    }
  })

  return realisationsWithCourseUnits
}

const router = express.Router()

router.get('/enrolled/:personId', async (req, res) => {
  const {
    params: { personId },
    query: { startDateBefore, endDateAfter },
  } = req

  const scopes = [
    startDateBefore && { method: ['activityPeriodStartDateBefore', new Date(startDateBefore)] },
    endDateAfter && { method: ['activityPeriodEndDateAfter', new Date(endDateAfter)] },
  ].filter(Boolean)

  const enrolments = await models.Enrolment.findAll({
    where: {
      personId,
    },
    attributes: relevantAttributes.enrolment,
    include: [
      {
        model: models.CourseUnitRealisation.scope(scopes),
        attributes: relevantAttributes.courseUnitRealisation,
        as: 'courseUnitRealisation',
      },
      {
        model: models.CourseUnit,
        attributes: relevantAttributes.courseUnit,
        as: 'courseUnit',
      },
    ],
  })

  res.send(enrolments)
})

router.get('/responsible/:personId', async (req, res) => {
  const {
    params: { personId },
  } = req

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    where: {
      responsibilityInfos: {
        [Op.contains]: [
          {
            personId: personId,
          },
        ],
      },
    },
  })

  const courseUnits = await models.CourseUnit.findAll({
    attributes: relevantAttributes.courseUnit,
    where: {
      responsibilityInfos: {
        [Op.contains]: [
          {
            personId: personId,
          },
        ],
      },
    },
  })

  const realisationsWithCourseUnits = await addRealisationsToCourseUnits(courseUnitRealisations)

  res.send({
    courseUnitRealisations: realisationsWithCourseUnits,
    courseUnits,
  })
})

router.get('/persons', async (req, res) => {
  const where = {}

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === 'token') return

    where[key] = { [Op.iLike]: `%${value}%` }
  })

  const persons = await models.Person.findAll({
    attributes: relevantAttributes.person,
    limit: 100,
    where,
  })

  res.send({
    persons,
  })
})

module.exports = router
