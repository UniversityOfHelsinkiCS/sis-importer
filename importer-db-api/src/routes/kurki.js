const express = require('express')
const _ = require('lodash')

const models = require('../models')
const { NotFoundError } = require('../errors')

const router = express.Router()

router.get('/students/:id', async (req, res) => {
  const {
    params: { id },
  } = req

  const student = await models.Person.findOne({
    where: {
      id,
    },
    include: [{ model: models.StudyRight, include: [models.Organisation] }],
  })

  if (!student) {
    throw new NotFoundError(`Student with id ${id} does not exist`)
  }

  res.send(student)
})

router.get('/course_unit_realisations/programme/:programmeCode', async (req, res) => {
  const { activityPeriodEndDateAfter } = req.query
  const { programmeCode } = req.params

  const organisation = await models.Organisation.findOne({
    where: {
      code: programmeCode,
    },
  })

  if (!organisation) {
    throw new NotFoundError('No such organization, use different code e.g. 500-K005')
  }

  const courses = (await organisation.getCourseUnits()).map(unit => ({
    id: unit.id,
    code: unit.code,
    name: unit.name,
    validityPeriod: unit.validityPeriod,
    groupId: unit.groupId,
    credits: unit.credits,
  }))

  const courseLookup = _.keyBy(courses, ({ groupId }) => groupId)

  const groupIds = courses.map(({ groupId }) => groupId)

  const assessmentItems = await models.AssessmentItem.scope('typeIsTeachingParticipation', {
    method: ['primaryCourseUnitGroupIdIn', groupIds],
  }).findAll()

  if (assessmentItems.length === 0) {
    return res.send([])
  }

  const assesmentItemLookup = _.keyBy(assessmentItems, ({ id }) => id)

  const assessmentItemIds = assessmentItems.map(({ id }) => id)

  const courseUnitRealisationScopes = [
    { method: ['assessmentItemIdsOverlap', assessmentItemIds] },
    activityPeriodEndDateAfter && { method: ['activityPeriodEndDateAfter', new Date(activityPeriodEndDateAfter)] },
  ].filter(Boolean)

  const courseUnitRealisations = await models.CourseUnitRealisation.scope(courseUnitRealisationScopes).findAll({
    raw: true,
  })

  const courseUnitRealisationsWithCodes = courseUnitRealisations.map(c => {
    const assesmentItems = c.assessmentItemIds.map(id => assesmentItemLookup[id]).filter(Boolean)
    const courseUnit = assesmentItems.map(a => courseLookup[a.primaryCourseUnitGroupId]).find(Boolean)

    return {
      ...c,
      courseUnitCode: _.get(courseUnit, 'code') || null,
    }
  })

  res.send(courseUnitRealisationsWithCodes)
})

module.exports = router
