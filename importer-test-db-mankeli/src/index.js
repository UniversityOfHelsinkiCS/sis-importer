const { knexConnection } = require('./db/connection')
const { bscStudents, mscStudents, otherStudents } = require('./studentNumbersForTestDump')

// Danger zone
const DESTROY = false
// How many students to fetch to dump
// 1/3 of student will be taken from new msc, 1/3 from new bsc and rest from the doctor
// + old programmes
const DUMP_SIZE = 900

knexConnection.on('error', e => {
  console.log('Knex database connection failed', e)
  process.exit(1)
})

knexConnection.on('connect', async () => {
  console.log('Knex database connection established successfully')
})

const getPersonIdsForStudentNumbers = async studentNumbers => {
  const { knex } = knexConnection

  return (await knex
    .select('id')
    .from('persons')
    .whereIn('student_number', studentNumbers)).map(person => person.id)
}

const removeAttainments = async (students) => {
  const { knex } = knexConnection
  const relevantAttainmentsAndCourseUnits = await knex.select('id', 'course_unit_id').from('attainments').whereIn('person_id', students).whereNotNull('course_unit_id')
  const courseUnitGroupIds = await knex.select('group_id').from('course_units').whereIn('id', relevantAttainmentsAndCourseUnits.map(({course_unit_id}) => course_unit_id))
  const relevantAssessmentItems = await knex.select('id').from('assessment_items').whereIn('primary_course_unit_group_id', courseUnitGroupIds.map(({group_id}) => group_id))
  const relevantCourseUnitRealisations = await knex.select('id').from('course_unit_realisations').where('assessment_item_ids', '&&', relevantAssessmentItems.map(({id}) => id))
  await Promise.all([
    removeStuff('attainments', 'id', relevantAttainmentsAndCourseUnits.map(({id}) => id), knex),
    removeStuff('course_units', 'group_id', courseUnitGroupIds.map(({group_id}) => group_id), knex),
    removeStuff('assessment_items', 'id', relevantAssessmentItems.map(({id}) => id), knex),
    removeStuff('course_unit_realisations', 'id', relevantCourseUnitRealisations.map(({id}) => id), knex)
  ])
}

const removeStudyRightsAndOthersFromTables = async students => {
  const { knex } = knexConnection
  const relevantStudyRights = await knex.select('*').from('studyrights').whereIn('person_id', students)
  const relevantModules = await knex.select('id').from('modules')
    .whereIn(
      'id',
      relevantStudyRights.map(s => Object.keys(s.accepted_selection_path).map(k => s.accepted_selection_path[k])).flat()
    )
  await Promise.all([
    removeStuff('studyrights', 'person_id', students, knex),
    removeStuff('study_right_primalities', 'student_id', students, knex),
    removeStuff('term_registrations', 'student_id', students, knex),
    removeStuff('modules', 'id', relevantModules.map(({id}) => id), knex)
  ])
}

/**
  * Nuke stuff from db in table by preserving rows with given values in given column.
  * @returns promise?
*/
const removeStuff = async (table, column, idsNotToDelete, knex) => {
  if (DESTROY)
    return knex(table).whereNotIn(column, idsNotToDelete).del()
  const res = await knex(table).whereNotIn(column, idsNotToDelete).count(column)
  console.log(`Would delete ${res[0].count} rows from ${table}`)
  return Promise.resolve(res[0].count)
}

const run = async () => {
  await knexConnection.connect()
  const { knex } = knexConnection

  const persons = await knex.table('persons')
  if (persons.length <= DUMP_SIZE) {
    console.log(`Found ${DUMP_SIZE} or less students from original db. Deletion was probably already performed?`)
    return
  }

  // Take first two hundred students from each category
  const studentNumbersFromSamples = [
    ...bscStudents.slice(0, DUMP_SIZE / 3),
    ...mscStudents.slice(0, DUMP_SIZE / 3),
    ...otherStudents.slice(0, DUMP_SIZE / 3)
  ]

  const selected = await getPersonIdsForStudentNumbers(studentNumbersFromSamples)

  removeStuff('persons', 'id', selected, knex)
  removeStudyRightsAndOthersFromTables(selected)
  removeStuff('enrolments', 'person_id', selected, knex)
  removeAttainments(selected)

  if (DESTROY) 
    console.log("Data deleted successfully")

}

run()
