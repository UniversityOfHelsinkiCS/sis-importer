const { Op } = require('sequelize')
const CourseUnit = require('../db/models/courseUnit')
const { getColumnsToUpdate } = require('../utils')

const parseCourse = courseUnit => {
  return {
    id: courseUnit.id,
    groupId: courseUnit.groupId,
    code: courseUnit.code,
    name: courseUnit.name,
    validityPeriod: courseUnit.validityPeriod,
    gradeScaleId: courseUnit.gradeScaleId,
    studyLevel: courseUnit.studyLevel,
    courseUnitType: courseUnit.courseUnitType,
    possibleAttainmentLanguages: courseUnit.possibleAttainmentLanguages,
    assessmentItemOrder: courseUnit.assessmentItemOrder,
    organisations: courseUnit.organisations,
    substitutions: courseUnit.substitutions,
    completionMethods: courseUnit.completionMethods,
    responsibilityInfos: courseUnit.responsibilityInfos
  }
}

module.exports = async ({ active, deleted, executionHash }, transaction) => {
  const parsedCourses = active.map(parseCourse)

  await CourseUnit.bulkCreate(parsedCourses, {
    updateOnDuplicate: getColumnsToUpdate(parsedCourses),
    transaction
  })

  await CourseUnit.destroy({
    where: {
      id: {
        [Op.in]: deleted
      }
    },
    transaction
  })

  return { executionHash }
}
