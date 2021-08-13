// eslint-disable-next-line no-unused-vars
const { api, unauthorizedApi } = require('./api')

test('unauthorized users can not use endpoints', async () => {
  const resp = await unauthorizedApi.get('/suotar/attainments/MAT11001/010408252')
  expect(resp.status).toBe(401)
  expect(resp.body).toStrictEqual({})
})

test('gets attainments by student number and course code', async () => {
  const resp = await api.get('/suotar/attainments/TKT10001/010231474')
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(1)

  const attainment = resp.body[0]
  expect(attainment.grade).not.toBeNull()
  expect(attainment.type).toBe('CourseUnitAttainment')
})

test('gets batch attainments by student number and course code', async () => {
  const resp = await api.post('/suotar/attainments').send([
    { courseCode: 'TKT10001', studentNumber: '010231474' },
    { courseCode: 'TKT10001', studentNumber: '010239573' },
    { courseCode: 'TKT10001', studentNumber: 'not-a-student' },
  ])
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(3)

  const student1 = resp.body.find(a => a.studentNumber === '010231474')
  const student2 = resp.body.find(a => a.studentNumber === '010239573')
  const invalidStudent = resp.body.find(a => a.studentNumber === 'not-a-student')

  expect(student1.attainments.length).toBe(1)
  expect(student2.attainments.length).toBe(1)
  expect(invalidStudent.attainments.length).toBe(0)

  expect(student1.attainments[0].personId).toBe('hy-hlo-130906952')
  expect(student1.attainments[0].credits).toBe(5)
  expect(student1.attainments[0].gradeId).toBe(3)
  expect(student2.attainments[0].personId).toBe('hy-hlo-128785149')
  expect(student2.attainments[0].credits).toBe(5)
  expect(student2.attainments[0].gradeId).toBe(5)
})

test('gets batch attainments by student number and course code with substituting course code', async () => {
  const resp = await api.post('/suotar/attainments').send([{ courseCode: '582102', studentNumber: '010231474' }])
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(1)

  expect(resp.body[0].attainments.length).toBe(1)
  expect(resp.body[0].attainments[0].personId).toBe('hy-hlo-130906952')
  expect(resp.body[0].attainments[0].courseUnitId).toBe('hy-CU-118023774-2019-08-01')
  expect(resp.body[0].attainments[0].credits).toBe(5)
  expect(resp.body[0].attainments[0].gradeId).toBe(3)
})

test('gets batch attainments by student number and course code without substitutions', async () => {
  const resp = await api
    .post('/suotar/attainments')
    .query({ noSubstitutions: true })
    .send([{ courseCode: '582102', studentNumber: '010231474' }])

  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(1)

  expect(resp.body[0].attainments.length).toBe(0)
})

test('gets batch enrollments by student number and course code', async () => {
  const resp = await api.post('/suotar/enrolments').send([
    { code: 'TKT20005', personId: 'hy-hlo-130906952' },
    { code: 'TKT20005', personId: 'hy-hlo-128785149' },
    { code: 'TKT20005', personId: 'not-a-student' },
  ])
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(3)

  const student1 = resp.body.find(a => a.personId === 'hy-hlo-130906952')
  const student2 = resp.body.find(a => a.personId === 'hy-hlo-128785149')
  const invalidStudent = resp.body.find(a => a.personId === 'not-a-student')

  expect(student1.enrolments.length).toBe(1)
  expect(student1.enrolments[0].personId).toBe('hy-hlo-130906952')
  expect(student1.enrolments[0].courseUnitId).toBe('hy-CU-118024854-2020-08-01')

  expect(student2.enrolments.length).toBe(1)
  expect(student2.enrolments[0].personId).toBe('hy-hlo-128785149')
  expect(student2.enrolments[0].courseUnitId).toBe('hy-CU-118024854-2020-08-01')

  expect(invalidStudent.enrolments.length).toBe(0)
})

test('gets acceptor persons for course unit realisation', async () => {
  const resp = await api.post('/suotar/acceptors').send(['hy-CUR-138156846', 'not-a-course'])
  expect(resp.status).toBe(200)

  expect(resp.body['hy-CUR-138156846'].length).toBe(1)
  expect(resp.body['hy-CUR-138156846']).toEqual([
    {
      roleUrn: 'urn:code:attainment-acceptor-type:approved-by',
      personId: 'hy-hlo-1552817',
    },
  ])
  expect(resp.body['not-a-course']).toBe(undefined)
})
