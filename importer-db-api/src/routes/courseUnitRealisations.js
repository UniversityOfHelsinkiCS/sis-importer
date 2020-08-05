const express = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')

const models = require('../models')
const { NotFoundError } = require('../errors')
const sisClient = require('../utils/sisClient')

const router = express.Router()

router.get('/', async (req, res) => {
  const { code } = req.query

  const courseUnit = await models.CourseUnit.findOne({
    where: {
      code,
    },
  })

  if (!courseUnit) {
    throw new NotFoundError(`Course unit with code ${code} is not found`)
  }

  const { groupId } = courseUnit

  const assessmentItem = await models.AssessmentItem.findOne({
    where: {
      primary_course_unit_group_id: groupId,
    },
  })

  const { id: assessmentItemId } = assessmentItem

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    where: {
      assessmentItemIds: {
        [Op.contains]: [assessmentItemId],
      },
    },
  })

  res.send(courseUnitRealisations)
})

router.get('/:id/enrolments', async (req, res) => {
  const { id } = req.params

  const enrolments = await sisClient.getEnrolmentsByCourseUnitRealisationId(id)

  res.send(enrolments)
})

router.get('/:id/study_group_sets', async (req, res) => {
  const { id } = req.params

  const courseUnitRealisation = await models.CourseUnitRealisation.findOne({
    where: {
      id,
    },
  })

  if (!courseUnitRealisation) {
    throw new NotFoundError(`Course unit realisation with id ${id} is not found`)
  }

  const { studyGroupSets = [] } = courseUnitRealisation

  const teacherIds = _.flatMap(studyGroupSets, group => {
    return _.flatMap(group.studySubGroups || [], subGroup => subGroup.teacherIds || [])
  })

  const persons =
    teacherIds.length > 0
      ? await models.Person.findAll({
          where: {
            id: {
              [Op.in]: teacherIds,
            },
          },
        })
      : []

  const studyGroupSetsWithTeachers = studyGroupSets.map(group => {
    return {
      ...group,
      studySubGroups: (group.studySubGroups || []).map(subGroup => {
        const { teacherIds = [] } = subGroup

        return {
          ...subGroup,
          teachers: teacherIds.map(teacherId => persons.find(({ id }) => id === teacherId)),
        }
      }),
    }
  })

  res.send(studyGroupSetsWithTeachers)
})

router.get('/:id/responsibility_infos', async (req, res) => {
  const { id } = req.params

  const responsibilityInfos = await sisClient.getCourseUnitRealisationResponsibilityInfos(id)

  res.send(responsibilityInfos)
})

module.exports = router
