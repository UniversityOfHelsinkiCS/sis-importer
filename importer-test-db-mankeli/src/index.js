const { knexConnection } = require('./db/connection')

knexConnection.on('error', e => {
  console.log('Knex database connection failed', e)
  process.exit(1)
})

knexConnection.on('connect', async () => {
  console.log('Knex database connection established successfully')
})

const getPersonIdsOfStudentsWithRecentStudyRights = async () => {
  const { knex } = knexConnection
  const getNewerThanDate = '2017-01-01'
  const nonDegreeEducations = knex
    .select('educations.id')
    .from('educations')
    .leftJoin('education_types', 'education_types.id', 'educations.education_type')
    .where('parent_id', 'urn:code:education-type:non-degree-education')

  return (await knex
    .select('persons.id')
    .from('persons')
    .leftJoin('studyrights', 'studyrights.person_id', 'persons.id')
    .where('grant_date', '>', getNewerThanDate)
    .whereNotIn('education_id', nonDegreeEducations)
    .distinctOn('student_number')).map(person => person.id)
}

const removeStudentsFromPersonsTable = async (students) => {
  const { knex } = knexConnection
  // replace select with del later
  const deleted = await knex('persons').whereNotIn('id', students)
  console.log(deleted.length)
}

const removeAttainments = async (students) => {
  const { knex } = knexConnection
  //const deleted = await knex.select('attainments.id').from('attainments').whereNotIn('person_id', students)
  const relevantAttainmentsAndCourseUnits = await knex.select('id', 'course_unit_id').from('attainments').whereIn('person_id', students).whereNotNull('course_unit_id')
  const courseUnitGroupIds = await knex.select('group_id').from('course_units').whereIn('id', relevantAttainmentsAndCourseUnits.map(({course_unit_id}) => course_unit_id))
  const relevantAssessmentItems = await knex.select('id').from('assessment_items').whereIn('primary_course_unit_group_id', courseUnitGroupIds.map(({group_id}) => group_id))
  const relevantCourseUnitRealisations = await knex.select('id').from('course_unit_realisations').where('assessment_item_ids', '&&', relevantAssessmentItems.map(({id}) => id))
  console.log(relevantAttainmentsAndCourseUnits.length, relevantAssessmentItems.length, relevantCourseUnitRealisations.length)
}

const removeEnrollments = async (students) => {
  const { knex } = knexConnection
  const relevantEnrollments = await knex.select('id').from('enrollments').whereIn('person_id', students)
  console.log(relevantEnrollments.length)
}

const getRandomSampleOfSizeN = (students, n) => {
  return [...students].sort(() => 0.5 - Math.random()).slice(0, n)
}

const removeStudyRightsAndOthersFromTables = async students => {
  const { knex } = knexConnection
  // replace these selects with del later
  const deletedStudyrights = await knex.select('*').from('studyrights').whereIn('person_id', students)
  console.log(deletedStudyrights.length)
  const deletedStudyRightPrimalities = await knex.select('*').from('study_right_primalities').whereIn('student_id', students)
  console.log(deletedStudyRightPrimalities.length)
  const deletedTermRegistrations = await knex.select('*').from('term_registrations').whereIn('student_id', students)
  console.log(deletedTermRegistrations.length)

}

const run = async () => {
  await knexConnection.connect()
  const { knex } = knexConnection

  const selected = getRandomSampleOfSizeN(await getPersonIdsOfStudentsWithRecentStudyRights(), 1000)

  await removeAttainments(selected)
  // await removeStudentsFromPersonsTable(selected)
  // await removeStudyRightsAndOthersFromTables(selected)

  // TODO: remove modules
  // TODO: remove other non related tables
}

run()
