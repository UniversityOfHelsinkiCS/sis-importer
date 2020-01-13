const parseEducationType = educationType => educationType

const parseEducation = education => {
  return {
    id: education.id,
    code: education.code,
    educationType: parseEducationType(education.educationType),
    groupId: education.groupId,
    startdate: education.validityPeriod,
    enddate: education.validityPeriod,
    structure: education.structure
  }
}

module.exports = ({ entities, executionHash }) => {
  entities.map(parseEducation)

  return { executionHash }
}
