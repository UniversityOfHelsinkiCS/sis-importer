const { AssessmentItem } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseAssessmentItem = assessmentItem => {
  return {
    id: assessmentItem.id,
    name: assessmentItem.name,
    nameSpecifier: assessmentItem.nameSpecifier,
    credits: assessmentItem.credits,
    gradeScaleId: assessmentItem.gradeScaleId,
    possibleAttainmentLanguages: assessmentItem.possibleAttainmentLanguages,
    assessmentItemType: assessmentItem.assessmentItemType,
    organisations: assessmentItem.organisations,
    primaryCourseUnitGroupId: assessmentItem.primaryCourseUnitGroupId,
    documentState: assessmentItem.documentState,
    modificationOrdinal: assessmentItem.metadata.modificationOrdinal
  }
}

// Assessment items need to be written into
// the db in a similar fashion as studyrights.
module.exports = async ({ active, deleted, executionHash }, transaction) => {
  const parsedAssessmentItems = [...active, ...deleted].map(parseAssessmentItem)
  await bulkCreate(AssessmentItem, parsedAssessmentItems, transaction, ['id', 'modificationOrdinal', 'autoId'])

  return { executionHash }
}
