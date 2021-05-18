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
  const nonDegreeEducations = knex.select('educations.id').from('educations')
                                  .leftJoin('education_types', 'education_types.id', 'educations.education_type')
                                  .where('parent_id', 'urn:code:education-type:non-degree-education')
  
  return await knex.select('student_number').from('persons')
                             .leftJoin('studyrights', 'studyrights.person_id', 'persons.id')
                             .where('grant_date', '>', getNewerThanDate)
                             .whereNotIn('education_id', nonDegreeEducations)
                             .distinct()
}

const run = async () => {
  await knexConnection.connect()

  const students = await getStudentsWithRecentStudyrights()
  console.log(students)
}

run()
