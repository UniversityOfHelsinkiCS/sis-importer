const express = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')
const dateFns = require('date-fns')

const models = require('../models')
const { NotFoundError } = require('../errors')

const router = express.Router()

router.get('/', async (req, res) => {
  const { code, activityPeriodEndDateAfter } = req.query

  const courseUnit = await models.CourseUnit.findOne({
    where: {
      code,
    },
  })

  if (!courseUnit) {
    throw new NotFoundError(`Course unit with code ${code} is not found`)
  }

  const { groupId } = courseUnit

  const assessmentItems = await models.AssessmentItem.findAll({
    where: {
      primary_course_unit_group_id: groupId,
    },
  })

  const assessmentItem = assessmentItems.find(item => item.id.includes('default-teaching-participation'))

  if (!assessmentItem) {
    return res.send([])
  }

  const { id: assessmentItemId } = assessmentItem

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    where: {
      assessmentItemIds: {
        [Op.contains]: [assessmentItemId],
      },
      ...(activityPeriodEndDateAfter && {
        [Op.and]: [
          { activityPeriod: { endDate: { [Op.ne]: null } } },
          {
            activityPeriod: {
              endDate: {
                [Op.gt]: dateFns.format(new Date(activityPeriodEndDateAfter), 'yyyy-MM-dd'),
              },
            },
          },
        ],
      }),
    },
  })

  res.send(courseUnitRealisations)
})

router.get('/:id/enrolments', async (req, res) => {
  const zip = (enrolments, persons) => {
    const personHash = persons.reduce((acc, p) => {
      acc[p.id] = p.dataValues
      return acc
    }, {})

    return enrolments.map(e => {
      return {
        ...e.dataValues,
        student: personHash[e.personId]
      }
    })
  }

  const { id } = req.params

  const enrolments = await models.Enrollment.findAll({
    where: {
      courseUnitRealisationId: id,
    },
  })

  const personIds = enrolments.map(e => e.personId)

  const persons = await models.Person.findAll({
    where: {
      id: {
        [Op.in]: personIds
      }
    }
  })

  res.send(zip(enrolments, persons))
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

  const courseUnitRealisation = await models.CourseUnitRealisation.findOne({ where: { id } })

  if (!courseUnitRealisation) {
    throw new NotFoundError(`Course unit realisation with id ${id} is not found`)
  }

  const { responsibilityInfos } = courseUnitRealisation

  if (!_.isArray(responsibilityInfos)) {
    return res.send([])
  }

  const personIds = responsibilityInfos.map(({ personId }) => personId).filter(Boolean)

  const persons =
    personIds.length > 0
      ? await models.Person.findAll({
          where: {
            id: {
              [Op.in]: personIds,
            },
          },
        })
      : []

  const responsibilityInfosWithPersons = responsibilityInfos.map(info => ({
    ...info,
    person: persons.find(({ id }) => id === info.personId),
  }))

  res.send(responsibilityInfosWithPersons)
})

module.exports = router
