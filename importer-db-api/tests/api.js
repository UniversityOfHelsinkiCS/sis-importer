const supertest = require('supertest')

const api = supertest.agent('http://localhost:3001').query({ token: 'sup3rSecre7TestT0ken' })

const unauthorizedApi = supertest.agent('http://localhost:3001')

module.exports = { api, unauthorizedApi }
