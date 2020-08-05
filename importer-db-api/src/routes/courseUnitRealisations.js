const express = require('express')
const { Op } = require('sequelize') 

const models = require('../models')
const { NotFoundError } = require('../errors')
const sisClient = require('../utils/sisClient');

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
  const { id } = req.params;

  const enrolments = await sisClient.getEnrolments(id);

  res.send(enrolments);
});

module.exports = router
