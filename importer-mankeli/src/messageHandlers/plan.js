const { bulkCreate, bulkDelete } = require('../utils/db')
const { Plan } = require('../db/models')

const parsePlan = plan => {
  return {
    id: plan.id,
    assessmentItemSelections: plan.assessmentItemSelections,
    courseUnitSelections: plan.courseUnitSelections,
    curriculumPeriodId: plan.curriculumPeriodId,
    customCourseUnitAttainmentSelections: plan.customCourseUnitAttainmentSelections,
    customModuleAttainmentSelections: plan.customModuleAttainmentSelections,
    learningOpportunityId: plan.learningOpportunityId,
    moduleSelections: plan.moduleSelections,
    primary: plan.primary,
    rootId: plan.rootId,
    userId: plan.userId
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(Plan, active.map(parsePlan), transaction)
  await bulkDelete(Plan, deleted, transaction)
}
