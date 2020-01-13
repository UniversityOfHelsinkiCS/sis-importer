const parseAssessmentItemType = assessmentItemType => {
  return assessmentItemType
}

const parseAssessmentItem = assessmentItem => {
  return {
    id: assessmentItem.id,
    name: assessmentItem.name,
    assessmentItemType: parseAssessmentItemType(assessmentItem.assessmentItemType),
    primaryCourseUnitGroupId: assessmentItem.primaryCourseUnitGroupId
  }
}

module.exports = ({ entities, executionHash }) => {
  entities.map(parseAssessmentItem)

  return { executionHash }
}
