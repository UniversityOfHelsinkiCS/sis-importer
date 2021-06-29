const { api, unauthorizedApi } = require('./api')

test('unauthorized users can not use endpoints', async () => {
  const resp = await unauthorizedApi.get('/suotar/attainments/MAT11001/010408252')
  expect(resp.status).toBe(401)
  expect(resp.body).toStrictEqual({})
})

test('gets attainments by student number and course code', async () => {
  const resp = await api.get('/suotar/attainments/MAT11001/010408252')
  expect(resp.status).toBe(200)
  expect(resp.body.length).toBe(1)

  const attainment = resp.body[0]
  expect(attainment.grade).not.toBeNull()
  expect(attainment.type).toBe('CourseUnitAttainment')
})
