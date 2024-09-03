const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL
  },
  pool: {
    min: 2,
    max: 20
  }
})

knex
  .raw('SELECT 1+1 AS result')
  .then(() => console.log('Connected to database!'))
  .catch(err => {
    console.error('Error connecting to database:')
    console.error(err)
  })

let DESTROY = false // DANGER ZONE

const wantedProgrammes = {
  KH50_001: { educationGroupId: 'hy-DP-114256174', organizationId: 'hy-org-116712512' },
  KH50_004: { educationGroupId: 'hy-DP-114256315', organizationId: 'hy-org-116715911' },
  MH50_001: { educationGroupId: 'hy-DP-114257251', organizationId: 'hy-org-116710675' },
  KH90_001: { educationGroupId: 'hy-DP-114256704', organizationId: 'hy-org-116714783' },
  MH90_001: { educationGroupId: 'hy-DP-114257711', organizationId: 'hy-org-116716892' },
  T923107: { educationGroupId: 'hy-DP-98664035', organizationId: 'hy-org-102437651' }
}

/**
 * The following query tries to find students who:
 * - have started on or after August 2017 in a given programme
 * - have a study plan for the same programme
 */
const getIdsOfSuitableStudentsFromTestDb = async () => {
  const wantedDegreeProgrammes = Object.values(wantedProgrammes).map(({ educationGroupId }) => educationGroupId)

  // We also want all students who have a primary study plan (at the time of writing this, there are only ~30 of them)
  const studentsWithPrimaryStudyPlan = await knex('plans').pluck('user_id').where('primary', true).distinctOn('user_id')

  const studentsFromProgrammes = await knex('studyrights')
    .pluck('person_id')
    .whereRaw("valid->>'startDate' >= '2017-08-01'")
    .andWhere(builder => {
      builder
        .whereRaw(
          `accepted_selection_path->>'educationPhase1GroupId' IN (${wantedDegreeProgrammes.map(_ => '?').join(',')})`,
          wantedDegreeProgrammes
        )
        .orWhereRaw(
          `accepted_selection_path->>'educationPhase2GroupId' IN (${wantedDegreeProgrammes.map(_ => '?').join(',')})`,
          wantedDegreeProgrammes
        )
    })
    // Most likely these are all non-primary study plans but let's keep this condition anyway to limit the number of students
    .join('plans', builder => {
      builder.on('studyrights.person_id', 'plans.user_id').andOn('studyrights.education_id', 'plans.root_id')
    })
    .distinctOn('person_id')

  return [...new Set([...studentsFromProgrammes, ...studentsWithPrimaryStudyPlan])]
}

/**
 * Nuke stuff from target db in table by preserving rows with given values in given column.
 */
const removeStuff = async (table, column, idsNotToDelete) => {
  if (DESTROY) {
    const deleted = await knex(table).whereNotIn(column, idsNotToDelete).del()
    const sizeNow = await knex(table).count(column)
    console.log(`Deleted ${deleted} rows from ${table}. Size now: ${sizeNow[0].count}`)
  } else {
    const toBeDeleted = await knex(table).whereNotIn(column, idsNotToDelete).count(column)
    const toBeKeeped = await knex(table).whereIn(column, idsNotToDelete).count(column)
    console.log(`Would delete ${toBeDeleted[0].count} rows from ${table} while keeping ${toBeKeeped[0].count} rows.`)
  }
}

const uniq = arr => [...new Set(arr.filter(item => item != null))]

const removeAttainmentRelatedData = async students => {
  const relevantAttainments = await knex('attainments')
    .select('id', 'course_unit_id', 'acceptor_persons')
    .whereIn('person_id', students)
    .andWhere(builder => {
      builder
        .where(builder => builder.whereNotNull('course_unit_id').orWhereNotNull('module_id'))
        .orWhereIn('type', ['CustomModuleAttainment', 'CustomCourseUnitAttainment'])
    })

  const courseUnitGroupIds = await knex('course_units')
    .pluck('group_id')
    .whereIn('id', [...new Set(relevantAttainments.map(({ course_unit_id }) => course_unit_id))])

  const relevantEnrolments = await knex('enrolments')
    .select('id', 'course_unit_realisation_id', 'assessment_item_id')
    .whereIn('person_id', students)

  const relevantEducationIds = await knex('studyrights').pluck('education_id').whereIn('person_id', students)

  await Promise.all([
    removeStuff('attainments', 'id', uniq(relevantAttainments.map(({ id }) => id))),
    removeStuff('course_units', 'group_id', uniq(courseUnitGroupIds)),
    removeStuff('assessment_items', 'id', uniq(relevantEnrolments.map(({ assessment_item_id }) => assessment_item_id))),
    removeStuff(
      'course_unit_realisations',
      'id',
      uniq(relevantEnrolments.map(({ course_unit_realisation_id }) => course_unit_realisation_id))
    ),
    removeStuff('enrolments', 'id', uniq(relevantEnrolments.map(({ id }) => id))),
    removeStuff('educations', 'id', uniq(relevantEducationIds))
  ])

  const relevantTeachers = relevantAttainments.reduce((acc, curr) => {
    const personIds = curr.acceptor_persons.map(({ personId }) => personId)
    for (const personId of personIds) {
      acc.add(personId)
    }
    return acc
  }, new Set())

  return await knex('persons')
    .pluck('id')
    .whereIn('id', [...relevantTeachers])
    .whereNotIn('id', students)
}

const removeStudyrightRelatedData = async students => {
  await Promise.all([
    removeStuff('studyrights', 'person_id', students),
    removeStuff('study_right_primalities', 'student_id', students),
    removeStuff('term_registrations', 'student_id', students)
  ])
}

const removePersonRelatedData = async personIds => {
  await Promise.all([
    removeStuff('persons', 'id', personIds),
    removeStuff('disclosures', 'person_id', personIds),
    removeStuff('plans', 'user_id', personIds)
  ])
}

const run = async () => {
  if (process.env.DESTROY === 'true') {
    DESTROY = true
  }
  const students = await getIdsOfSuitableStudentsFromTestDb()
  const teachers = await removeAttainmentRelatedData(students)
  await removeStudyrightRelatedData(uniq(students))
  await removePersonRelatedData(uniq([...students, ...teachers]))
}

run()
  .then(() => {
    console.log('index.js finished successfully')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
