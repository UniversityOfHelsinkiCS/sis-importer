const axios = require('axios').default
const { request } = require('./index')
const { SIS_API_URL, PROXY_TOKEN } = process.env

const koriInstance = axios.create({
  baseURL: `${SIS_API_URL}/kori/api`,
  headers: { token: PROXY_TOKEN }
})

const koriRequest = async (path, retry = 6) => request(koriInstance, path, retry)

module.exports = {
  koriRequest
}
