const { Education } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseEducation = education => {
  return {
    id: education.id,
    groupId: education.groupId,
    name: education.name,
    code: education.code,
    educationType: education.educationType,
    validityPeriod: education.validityPeriod,
    organisations: education.organisations,
    universityOrgIds: education.universityOrgIds,
    attainmentLanguages: education.attainmentLanguages,
    structure: education.structure,
    studyFields: education.studyFields,
    responsibilityInfos: education.responsibilityInfos
  }
}

module.exports = async ({ active, deleted, executionHash }, transaction) => {
  await bulkCreate(Education, active.map(parseEducation), transaction)
  await bulkDelete(Education, deleted, transaction)
  return { executionHash }
}
