const { CourseUnit } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseCourse = courseUnit => {
  return {
    id: courseUnit.id,
    groupId: courseUnit.groupId,
    code: courseUnit.code,
    credits: courseUnit.credits,
    name: courseUnit.name,
    validityPeriod: courseUnit.validityPeriod,
    gradeScaleId: courseUnit.gradeScaleId,
    studyLevel: courseUnit.studyLevel,
    courseUnitType: courseUnit.courseUnitType,
    possibleAttainmentLanguages: courseUnit.possibleAttainmentLanguages,
    assessmentItemOrder: courseUnit.assessmentItemOrder,
    organisations: courseUnit.organisations,
    universityOrgIds: courseUnit.universityOrgIds,
    studyFields: courseUnit.studyFields,
    substitutions: courseUnit.substitutions,
    completionMethods: courseUnit.completionMethods,
    responsibilityInfos: courseUnit.responsibilityInfos
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(CourseUnit, active.map(parseCourse), transaction)
  await bulkDelete(CourseUnit, deleted, transaction)
}
