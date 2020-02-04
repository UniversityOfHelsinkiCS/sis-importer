const axios = require('axios').default
const fs = require('fs')
const https = require('https')
const { request } = require('./index')
const { SIS_API_URL, PROXY_TOKEN, KEY_PATH, CERT_PATH } = process.env

const agent =
  KEY_PATH && CERT_PATH
    ? new https.Agent({
        cert: fs.readFileSync(process.env.CERT_PATH, 'utf8'),
        key: fs.readFileSync(process.env.KEY_PATH, 'utf8')
      })
    : new https.Agent()

const koriInstance = axios.create({
  baseURL: `${SIS_API_URL}/kori/api`,
  headers: { token: PROXY_TOKEN },
  httpsAgent: agent
})

const koriRequest = async (path, retry = 6) => request(koriInstance, path, retry)

module.exports = {
  koriRequest
}
