const axios = require('axios').default
const sleep = require('./sleep')
const { SIS_API_URL, PROXY_TOKEN } = process.env

const oriInstance = axios.create({
  baseURL: `${SIS_API_URL}/ori/api`,
  headers: { token: PROXY_TOKEN }
})

const request = async (path, retry = 6) => {
  for (let i = 1; i <= retry; i++) {
    try {
      const res = await oriInstance.get(path)
      return res.data
    } catch (e) {
      if (i === retry) {
        console.log(`Request failed for ${path}`)
        throw e
      }
      console.log(`Retrying ${i}/${retry - 1} for ${path}`)
      await sleep(i * 1000)
    }
  }
  throw new Error(`Request failed for ${path}`)
}

module.exports = {
  request
}
