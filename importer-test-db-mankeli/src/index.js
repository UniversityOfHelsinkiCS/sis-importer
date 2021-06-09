const { connection } = require('./db/connection')
const { bscStudents, mscStudents, otherStudents } = require('./studentNumbersForTestDump')

const { AssessmentItem, Attainment, CourseUnit, CourseUnitRealisation, StudyRight, StudyRightPrimality, TermRegistration, Person } = require('./db/models')

const tableToModel = {
    assessment_items: AssessmentItem,
    attainments: Attainment, 
    course_unit_realisations: CourseUnitRealisation, 
    course_units: CourseUnit, 
    persons: Person, 
    studyrights: StudyRight, 
    study_right_primalities: StudyRightPrimality, 
    term_registrations: TermRegistration 
}

const getSampleOfPersonsFromTestDb = async () => {
  const { knex } = connection 

  // Settings for sample to be fetched
  // TODO: get these from config and don't hardcode
  const sampleSize = 20
  const compScienceBachMastProgrammeEducation = 'hy-EDU-114256325-2017'
  const startDateForNewProgrammes = '2017-01-08'

  return await knex
    .select('persons.*')
    .from('persons')
    .join('studyrights', 'persons.id', '=', 'studyrights.person_id')
    .join('term_registrations', 'studyrights.id', '=', 'term_registrations.study_right_id')
    .where('education_id', compScienceBachMastProgrammeEducation)
    .andWhere('state', 'ACTIVE')
    .andWhereRaw("cast(studyrights.valid->>'startDate' as date) >= ?", new Date(startDateForNewProgrammes))
    .andWhere(builder => builder.whereNotNull('student_number'))
    .andWhere(builder => builder.whereNotNull('first_names'))
    .andWhere(builder => builder.whereNotNull('last_name'))
    .distinctOn('student_number')
    .limit(sampleSize)
}


const getDataForSelectedStudents = async students => {
  const { knex } = connection 
  const studentIds = students.map(({id}) => id)

  const attainmentQuery = knex.select().from('attainments').whereIn('person_id', studentIds).whereNotNull('course_unit_id')
  const attainments = await attainmentQuery
  const courseUnits = await knex.select().from('course_units').whereIn('id', attainments.map(({course_unit_id}) => course_unit_id))
  const assessmentItems = await knex.select().from('assessment_items').whereIn('primary_course_unit_group_id', courseUnits.map(({group_id}) => group_id))
  const courseUnitRealisations = await knex.select().from('course_unit_realisations').where('assessment_item_ids', '&&', assessmentItems.map(({id}) => id))
  const teachers = await knex.select().from('persons')
  .where(builder => builder.whereIn('id', 
    attainments.reduce((acc, curr) => 
      [...acc, ...curr.acceptor_persons.map(({personId}) => personId)], []
    ))
  .andWhere(builder => builder.whereNotIn('id', studentIds))
  )

  const studyRights = await knex.select().from('studyrights').whereIn('person_id', studentIds)
  const studyRightPrimalities = await knex.select().from('study_right_primalities').whereIn('student_id', studentIds)

  // console.log(JSON.stringify(termRegistrations))
  const persons = [...students, ...teachers]

  return {
    assessment_items: assessmentItems,
    attainments: attainments, 
    course_unit_realisations: courseUnitRealisations, 
    course_units: courseUnits, 
    persons: persons, 
    studyrights: studyRights, 
    study_right_primalities: studyRightPrimalities, 
    //term_registrations: termRegistrations
    // TODO: this fails for some reason when
    //inserting to db, what
  }
}

const replaceDataInTable = ({table, data}) => {
  const model = tableToModel[table]
  model.truncate()
  return model.bulkCreate(data)
}

const writeDataToSampleDb = async data => {
  for (const table_name of Object.keys(data)) {
    try {
      const res = await replaceDataInTable({table: table_name, data: data[table_name]})
      console.log(`Wrote ${res.length} lines to ${table_name}, replacing previous data`)
    } catch (e) {
      console.log("Errored with table ", table_name)
      console.log("error", e)
    }
  }
}

const run = async () => {
  // Toggle this to write the sample db
  const WRITE = true

  const students = await getSampleOfPersonsFromTestDb()
  const dataForSelectedPersons = await getDataForSelectedStudents(students)
  if (WRITE) {
    console.log("Creating new sample database")
    writeDataToSampleDb(dataForSelectedPersons)

    const { knex } = connection 
    const studentIds = students.map(({id}) => id)
    const termRegistrations = await knex.select().from('term_registrations')
      .whereIn('student_id', studentIds)

    console.log(JSON.stringify(termRegistrations[0], null, 2))

    writeDataToSampleDb({
      term_registrations: [example]
    })

  } else {
    console.log("Would write following number of rows to sample db")
    Object.entries(dataForSelectedPersons).forEach(([table_name, values]) => {
      console.log(`Table ${table_name}: ${values.length}`)
    })
  }
}

run()
