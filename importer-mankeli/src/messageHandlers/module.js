const { Module } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseModule = mod => {
  return {
    id: mod.id,
    universityOrgIds: mod.universityOrgIds,
    groupId: mod.groupId,
    moduleContentApprovalRequired: mod.moduleContentApprovalRequired,
    code: mod.code,
    targetCredits: mod.targetCredits,
    curriculumPeriodIds: mod.curriculumPeriodIds,
    approvalState: mod.approvalState,
    validityPeriod: mod.validityPeriod,
    contentDescription: mod.contentDescription,
    responsibilityInfos: mod.responsibilityInfos,
    organisations: mod.organisations,
    name: mod.name,
    studyLevel: mod.studyLevel,
    possibleAttainmentLanguages: mod.possibleAttainmentLanguages,
    studyFields: mod.studyFields,
    graded: mod.graded,
    gradeScaleId: mod.gradeScaleId,
    studyRightSelectionType: mod.studyRightSelectionType,
    minorStudyRightAcceptanceType: mod.minorStudyRightAcceptanceType,
    type: mod.type,
    rule: mod.rule,
    degreeTitleUrns: mod.degreeTitleUrns
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(Module, active.map(parseModule), transaction)
  await bulkDelete(Module, deleted, transaction)
}
