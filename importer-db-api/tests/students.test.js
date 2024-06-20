const { auth, invalidAuth } = require('./api')
const supertest = require('supertest')
const app = require('../src/app')

test.skip('unauthorized users can not use endpoints', async () => {
  let resp = await supertest(app).get('/students/010408252/studyrights')
  expect(resp.status).toBe(401)
  expect(resp.body).toStrictEqual({})

  resp = await supertest(app).get('/students/010408252/studyrights').query(invalidAuth)
  expect(resp.status).toBe(401)
  expect(resp.body).toStrictEqual({})
})

test('get student study rights', async () => {
  const resp = await supertest(app).get('/students/010231474/studyrights').query(auth)
  expect(resp.status).toBe(200)
  expect(resp.body).toHaveLength(1)
  expect(resp.body[0].elements).not.toBe(undefined)
  expect(resp.body[0].faculty_code).not.toBe(undefined)
})

test('get student study rights with not a valid user', async () => {
  const resp = await supertest(app).get('/students/not-a-student-number/studyrights').query(auth)
  expect(resp.status).toBe(500)
  expect(resp.body.error).not.toBe(undefined)
})
