const axios = require('axios').default
const fs = require('fs')
const https = require('https')
const { request } = require('./index')
const { getAuthHeaders } = require('./auth')
const { SIS_API_URL, KEY_PATH, CERT_PATH } = process.env

const hasCerts = KEY_PATH && CERT_PATH

const getHeaders = () => {
  return getAuthHeaders()
}

const agent = hasCerts
  ? new https.Agent({
      cert: fs.readFileSync(CERT_PATH, 'utf8'),
      key: fs.readFileSync(KEY_PATH, 'utf8')
    })
  : new https.Agent()

const oriInstance = axios.create({
  baseURL: `${SIS_API_URL}/ori/api`,
  headers: getHeaders(),
  httpsAgent: agent
})

const oriRequest = async (path, retry = 6) => request(oriInstance, path, retry)

module.exports = {
  oriRequest
}
