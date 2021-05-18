const { knexConnection } = require('./db/connection')

knexConnection.on('error', e => {
  console.log('Knex database connection failed', e)
  process.exit(1)
})

knexConnection.on('connect', async () => {
  console.log('Knex database connection established successfully')
})

const getStudentsWithRecentStudyrights = async () => {
  const { knex } = knexConnection
  const getNewerThanDate = '2017-01-01'
  const nonDegreeEducations = knex
    .select('educations.id')
    .from('educations')
    .leftJoin('education_types', 'education_types.id', 'educations.education_type')
    .where('parent_id', 'urn:code:education-type:non-degree-education')

  return knex
    .select('*')
    .from('persons')
    .leftJoin('studyrights', 'studyrights.person_id', 'persons.id')
    .where('grant_date', '>', getNewerThanDate)
    .whereNotIn('education_id', nonDegreeEducations)
    .distinctOn('student_number')
}

const getRandomSampleOfSizeN = (students, n) => {
  return [...students].sort(() => 0.5 - Math.random()).slice(0, n)
}

const getStudyRightsAndRelatedTables = async students => {
  const { knex } = knexConnection
  const personIds = students.map(s => s.person_id)
  const studyRights = await knex.select('*').from('studyrights').whereIn('person_id', personIds)
  const studyRightIds = studyRights.map(sr => sr.id)

  // should return studyrights, primalities, term_registrations
  return [0, 0, 0]
}

const run = async () => {
  await knexConnection.connect()

  const students = getRandomSampleOfSizeN(await getStudentsWithRecentStudyrights(), 1000)

  // Studyrights
  const [studyrights, study_right_primalities, term_registrations] = await getStudyRightsAndRelatedTables(students)
}

run()
