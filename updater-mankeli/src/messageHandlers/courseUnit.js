const parseCourse = courseUnit => {
  const TODO = undefined

  return {
    code: courseUnit.code,
    name: courseUnit.name,
    latest_instance_date: TODO, // calculated from course unit realisations or attainments
    is_study_module: TODO, // doesn't exist anymore?
    coursetypecode: TODO, // from courseUnitType? https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:course-unit-type
    startdate: courseUnit.validityPeriod.startDate || null,
    enddate: courseUnit.validityPeriod.endDate || null,
    max_attainment_date: TODO, // calculated from attainments
    min_attainment_date: TODO // calculated from attainments
  }
}

module.exports = async ({ entities, executionHash }) => {
  entities.map(parseCourse)

  return { executionHash }
}
