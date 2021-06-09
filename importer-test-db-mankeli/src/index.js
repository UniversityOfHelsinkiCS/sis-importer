const { sourceConnection, targetConnection } = require('./db/connection')

const DESTROY = true 

const getIdsOfSuitableStudentsFromTestDb = async () => {
  const { knex } = sourceConnection

  // Settings for sample to be fetched
  // TODO: get these from config and don't hardcode
  const sampleSize = 100
  const compScienceBachMastProgrammeEducation = 'hy-EDU-114256325-2017'
  const startDateForNewProgrammes = '2017-01-08'

  return (await knex
  //return await knex
    .select('persons.id')
    .from('persons')
    .join('studyrights', 'persons.id', 'studyrights.person_id')
    .join('term_registrations', 'studyrights.id', 'term_registrations.study_right_id')
    .join('attainments', builder => 
      builder.on('attainments.person_id', 'persons.id')
             .andOn('attainments.study_right_id', 'studyrights.id')
    )
    .where('studyrights.education_id', compScienceBachMastProgrammeEducation)
    .andWhere(
      builder => builder.whereNotNull(
        'persons.student_number', 'persons.first_names', 'persons.last_name'
      )
    )
    .andWhereRaw("cast(studyrights.valid->>'startDate' as date) >= ?", new Date(startDateForNewProgrammes))
    .distinctOn('persons.student_number')
    .limit(sampleSize)
    //.toSQL().toNative())
  ).map(({id}) => id)
  return [] 
}

/**
  * Nuke stuff from target db in table by preserving rows with given values in given column.
  * @returns promise?
*/
const removeStuff = async (table, column, idsNotToDelete) => {
  const { knex } = targetConnection
  if (DESTROY) {
    const deleted = await knex(table).whereNotIn(column, idsNotToDelete).del()
    const sizeNow = await knex(table).count()
    console.log(`Deleted ${deleted} lines from ${table}. Size now: ${sizeNow[0].count}`)
    return
  }
  const toBeDeleted = await knex(table).whereNotIn(column, idsNotToDelete).count(column)
  const toBeKeeped = await knex(table).whereIn(column, idsNotToDelete).count(column)
  console.log(`Would delete ${toBeDeleted[0].count} rows from ${table} while keeping ${toBeKeeped[0].count} rows.`)
  return Promise.resolve(toBeKeeped[0].count)
}

const removeAttainmentRelatedData = async students => {
  const { knex } = sourceConnection
  const relevantAttainmentsAndCourseUnits = await knex.select('id', 'course_unit_id', 'acceptor_persons').from('attainments').whereIn('person_id', students).whereNotNull('course_unit_id')
  const courseUnitGroupIds = await knex.select('group_id').from('course_units').whereIn('id', relevantAttainmentsAndCourseUnits.map(({course_unit_id}) => course_unit_id))
  const relevantAssessmentItems = await knex.select('id').from('assessment_items').whereIn('primary_course_unit_group_id', courseUnitGroupIds.map(({group_id}) => group_id))
  const relevantCourseUnitRealisations = await knex.select('id').from('course_unit_realisations').where('assessment_item_ids', '&&', relevantAssessmentItems.map(({id}) => id))
  await Promise.all([
    removeStuff('attainments', 'id', relevantAttainmentsAndCourseUnits.map(({id}) => id)),
    removeStuff('course_units', 'group_id', courseUnitGroupIds.map(({group_id}) => group_id)),
    removeStuff('assessment_items', 'id', relevantAssessmentItems.map(({id}) => id)),
    removeStuff('course_unit_realisations', 'id', relevantCourseUnitRealisations.map(({id}) => id)),
    removeStuff('enrolments', 'person_id', students)
  ])
  const personIdsOfRelevantTeachers = (await knex.select().from('persons')
      .where(builder => builder.whereIn('id', 
        relevantAttainmentsAndCourseUnits.reduce((acc, curr) => 
          [...acc, ...curr.acceptor_persons.map(({personId}) => personId)], []
        ))
      .andWhere(builder => builder.whereNotIn('id', students))
      )
  ).map(({id}) => id)
  return personIdsOfRelevantTeachers
}

const removeStudyrightRelatedData = async students => {
  const { knex } = sourceConnection
  const relevantEducations = await knex.select('education_id').from('studyrights').whereIn('person_id', students)
  await Promise.all([
    removeStuff('educations', 'id', relevantEducations.map(({education_id}) => education_id)),
    removeStuff('studyrights', 'person_id', students),
    removeStuff('study_right_primalities', 'student_id', students),
    removeStuff('term_registrations', 'student_id', students)
  ])
}

const removePersons = async (students, teachers) => {
  await removeStuff('persons', 'id', [...students, ...teachers])
}

const run = async () => {
  const students = await getIdsOfSuitableStudentsFromTestDb()
  const teachers = await removeAttainmentRelatedData(students)
  removeStudyrightRelatedData(students)
  removePersons(students, teachers)
}

run()
