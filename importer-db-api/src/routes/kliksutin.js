const express = require('express')
const { sequelize } = require('../config/db.js')
const models = require('../models')

const router = express.Router()

router.get('/courses/:personId', async (req, res) => {
  const { personId: teacherId } = req.params

  const teacherCourses = await sequelize.query(
    `
    SELECT cu.*
    FROM (
      SELECT 
      id, 
      jsonb_array_elements(responsibility_infos)->>'personId' AS person_id 
      FROM course_units
    ) AS cu_persons
    INNER JOIN course_units cu ON cu.id = cu_persons.id
    WHERE person_id = :teacherId
    AND DATE(cu.validity_period->>'endDate') > NOW()
    AND DATE(cu.validity_period->>'startDate') < NOW() + interval '6 months'
    ORDER BY cu.code
  `,
    { mapToModel: true, model: models.CourseUnit, type: sequelize.QueryTypes.SELECT, replacements: { teacherId } }
  )

  res.send(teacherCourses)
})

module.exports = router
