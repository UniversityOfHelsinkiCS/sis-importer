const parseCourseUnitRealisation = courseUnitRealisation => {
  const TODO = undefined
  return {
    name: courseUnitRealisation.name,
    startdate: courseUnitRealisation.activityPeriod.startDate,
    enddate: courseUnitRealisation.activityPeriod.endDate,
    realisationtypecode: TODO, // FROM courseUnitRealisationTypeUrn,
    assessmentItemIds: courseUnitRealisation.assessmentItemIds,
    coursecode: TODO // assessmentItemIds -> courseunits
  }
}

module.exports = ({ entities, executionHash }) => {
  entities.map(parseCourseUnitRealisation)

  return { executionHash }
}
