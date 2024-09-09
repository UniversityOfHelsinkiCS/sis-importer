const { auth, invalidAuth } = require('./api')
const supertest = require('supertest')
const app = require('../src/app')

test.skip('unauthorized users can not use endpoints', async () => {
  let resp = await supertest(app).get('/suotar/attainments/MAT11001/010408252')
  expect(resp.status).toBe(401)
  expect(resp.body).toStrictEqual({})

  resp = await supertest(app).get('/suotar/attainments/MAT11001/010408252').query(invalidAuth)
  expect(resp.status).toBe(401)
  expect(resp.body).toStrictEqual({})
})

test('gets attainments by student number and course code', async () => {
  const resp = await supertest(app).get('/suotar/attainments/MAT11001/433237').query(auth)
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(1)

  const attainment = resp.body[0]
  expect(attainment.grade).not.toBeNull()
  expect(attainment.type).toBe('CourseUnitAttainment')
})

test('gets batch attainments by student number and course code', async () => {
  const studentNumbers = ['433237', '457144', 'not-a-student']
  const courseCode = 'MAT11001'
  const resp = await supertest(app)
    .post('/suotar/attainments')
    .query(auth)
    .send(studentNumbers.map(studentNumber => ({ courseCode, studentNumber })))
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(3)

  const student1 = resp.body.find(a => a.studentNumber === studentNumbers[0])
  const student2 = resp.body.find(a => a.studentNumber === studentNumbers[1])
  const invalidStudent = resp.body.find(a => a.studentNumber === studentNumbers[2])

  expect(student1.attainments.length).toBe(1)
  expect(student2.attainments.length).toBe(1)
  expect(invalidStudent.attainments.length).toBe(0)

  expect(student1.attainments[0].personId).toBe('hy-hlo-136707223')
  expect(student1.attainments[0].credits).toBe(5)
  expect(student1.attainments[0].gradeId).toBe(4)
  expect(student2.attainments[0].personId).toBe('hy-hlo-136960999')
  expect(student2.attainments[0].credits).toBe(5)
  expect(student2.attainments[0].gradeId).toBe(5)
})

test('gets batch attainments with invalid data', async () => {
  const resp = await supertest(app).post('/suotar/attainments').query(auth).send('wat')
  expect(resp.status).toBe(400)
  expect(resp.body.error).not.toBeNull()
})

test('gets batch attainments by student number and course code with substituting course code', async () => {
  const resp = await supertest(app)
    .post('/suotar/attainments')
    .query(auth)
    .send([{ courseCode: '582102', studentNumber: '544261' }])
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(1)

  expect(resp.body[0].attainments.length).toBe(1)
  expect(resp.body[0].attainments[0].personId).toBe('hy-hlo-102720914')
  expect(resp.body[0].attainments[0].courseUnitId).toBe('hy-CU-53598640-2014-08-01')
  expect(resp.body[0].attainments[0].credits).toBe(5)
  expect(resp.body[0].attainments[0].gradeId).toBe(5)
})

test('gets batch attainments by student number and course code without substitutions', async () => {
  const resp = await supertest(app)
    .post('/suotar/attainments')
    .query({ noSubstitutions: true })
    .query(auth)
    .send([{ courseCode: '582102', studentNumber: '495759' }])

  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(1)

  expect(resp.body[0].attainments.length).toBe(0)
})

test('gets batch enrollments by student number and course code', async () => {
  const personIds = ['hy-hlo-125835733', 'hy-hlo-124371492', 'not-a-student']
  const resp = await supertest(app)
    .post('/suotar/enrolments')
    .query(auth)
    .send(personIds.map(personId => ({ code: 'TKT20005', personId })))
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(3)

  const student1 = resp.body.find(a => a.personId === personIds[0])
  const student2 = resp.body.find(a => a.personId === personIds[1])
  const invalidStudent = resp.body.find(a => a.personId === 'not-a-student')

  expect(student1.enrolments.length).toBe(2)
  for (const enrolment of student1.enrolments) {
    expect(enrolment.personId).toBe(personIds[0])
    expect(enrolment.courseUnitId).toBe('hy-CU-118024854-2020-08-01')
  }

  expect(student2.enrolments.length).toBe(3)
  student2.enrolments
    .toSorted((a, b) => new Date(a.enrolmentDateTime).getTime() - new Date(b.enrolmentDateTime).getTime())
    .forEach((enrolment, i) => {
      expect(enrolment.personId).toBe(personIds[1])
      if (i === 0) {
        expect(enrolment.courseUnitId).toBe('hy-CU-118024854-2020-08-01')
      } else {
        expect(enrolment.courseUnitId).toBe('hy-CU-118024854-2021-08-01')
      }
    })

  expect(invalidStudent.enrolments.length).toBe(0)
})

test.skip('gets batch enrollments with invalid data', async () => {
  let resp = await supertest(app).post('/suotar/enrolments').query(auth).send('wat')
  expect(resp.status).toBe(400)
  expect(resp.body.error).not.toBeNull()

  resp = await supertest(app)
    .post('/suotar/enrolments')
    .query(auth)
    .send([
      { code: null, personId: 'hy-hlo-130906952' },
      { code: 'TKT20005', personId: null }
    ])
  expect(resp.status).toBe(200)
  expect(resp.body).toEqual([])
})

test('gets acceptor persons for course unit realisation', async () => {
  const resp = await supertest(app).post('/suotar/acceptors').query(auth).send(['hy-CUR-125181002', 'not-a-course'])
  expect(resp.status).toBe(200)

  expect(resp.body['hy-CUR-125181002'].length).toBe(1)
  expect(resp.body['hy-CUR-125181002']).toEqual([
    {
      roleUrn: 'urn:code:attainment-acceptor-type:approved-by',
      personId: 'hy-hlo-1533943',
      text: null
    }
  ])
  expect(resp.body['not-a-course']).toBe(undefined)
})

test('gets responsible teachers correctly by course code', async () => {
  const resp = await supertest(app).get('/suotar/responsibles/MAT21019').query(auth)

  const persons = Object.keys(resp.body)

  expect(persons.length).toBe(6)
  for (const person of persons) {
    expect(resp.body[person].person).not.toBe(undefined)
    expect(resp.body[person].roles.length).toBeGreaterThan(0)
  }
})
