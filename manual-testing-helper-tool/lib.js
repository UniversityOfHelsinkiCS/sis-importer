require('dotenv').config()
const axios = require('axios').default

const { SIS_API_URL, PROXY_TOKEN } = process.env

if (!SIS_API_URL || !PROXY_TOKEN) console.log('Fill .env file with SIS_API_URL and PROXY_TOKEN')

const wait = ms =>
  new Promise(res =>
    setTimeout(() => {
      res()
    }, ms)
  )

const axiosInstance = axios.create({
  baseURL: SIS_API_URL,
  headers: { token: PROXY_TOKEN }
})

const apiHealthCheck = async () => {
  const healthCheckPath = 'kori/api/course-units/v1/export?since=0&limit=1'

  while (true) {
    try {
      await axiosInstance.get(healthCheckPath)
      break
    } catch (err) {
      console.log('Is the node-proxy running? Retrying in 2 seconds')
      await wait(2000)
    }
  }
}

module.exports = {
  apiHealthCheck,
  axiosInstance,
  wait
}
