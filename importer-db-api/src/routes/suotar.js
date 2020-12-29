const router = require('express').Router()
const axios = require('axios').default
const fs = require('fs')
const https = require('https')
const { SIS_API_URL, PROXY_TOKEN, KEY_PATH, CERT_PATH, API_KEY } = process.env

const hasCerts = KEY_PATH && CERT_PATH

const getHeaders = () => {
  if (!hasCerts) return { token: PROXY_TOKEN || '' }
  else if (hasCerts && API_KEY) return { 'X-Api-Key': API_KEY }
  return {}
}

const agent = hasCerts
  ? new https.Agent({
      cert: fs.readFileSync(CERT_PATH, 'utf8'),
      key: fs.readFileSync(KEY_PATH, 'utf8')
    })
  : new https.Agent()

const sisApi = axios.create({
  baseURL: SIS_API_URL,
  headers: getHeaders(),
  httpsAgent: agent
})

/**
 * Send assessments to Sisu
 */
router.post('/', async (req, res) => {
  try {
    const { body } = req
    const resp = await sisApi.post('/hy-custom/assessments/send/kurki', body)
    return res.status(200).json(resp.data)
  } catch (e) {
    console.log(e)
    res.status(500).json(e.response.data)
  }
})

module.exports = router
