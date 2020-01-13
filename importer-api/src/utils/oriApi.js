const axios = require('axios').default
const { request } = require('./index')
const { SIS_API_URL, PROXY_TOKEN } = process.env

const oriInstance = axios.create({
  baseURL: `${SIS_API_URL}/ori/api`,
  headers: { token: PROXY_TOKEN }
})

const oriRequest = async (path, retry = 6) => request(oriInstance, path, retry)

module.exports = {
  oriRequest
}
