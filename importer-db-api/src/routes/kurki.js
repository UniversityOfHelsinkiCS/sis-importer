const express = require('express')
const _ = require('lodash')

const models = require('../models')
const { NotFoundError } = require('../errors')
const { Op } = require('sequelize')

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

  const courses = await organisation.getCourses()

  const groupIds = courses.map(c => c.groupId)

  const assessmentItems = await models.AssessmentItem.findAll({
    where: {
      primary_course_unit_group_id: {
        [Op.in]: groupIds,
      },
    },
  })

  const validAssessmentItems = assessmentItems.filter(item => item.id.includes('default-teaching-participation'))

  if (validAssessmentItems.length === 0) {
    return res.send([])
  }

  const assessmentItemIds = _.uniq(validAssessmentItems.map(a => a.id))

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    where: {
      assessmentItemIds: {
        [Op.overlap]: assessmentItemIds
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

module.exports = router
