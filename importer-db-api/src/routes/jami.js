const router = require('express').Router()
const axios = require('axios').default
const fs = require('fs')
const https = require('https')

const logger = require('../utils/logger')

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
      key: fs.readFileSync(KEY_PATH, 'utf8'),
    })
  : new https.Agent()

const sisApi = axios.create({
  baseURL: SIS_API_URL,
  headers: getHeaders(),
  httpsAgent: agent,
})

// Get person's roles from HY-Sisu custom API
router.get('/sisuroles/:id', async (req, res) => {
  const { id } = req.params
  if (!id) return res.status(400).send('No id provided')
  try {
    const { data } = await sisApi.get(`/hy-custom/personsisuroles/v1/person/${id}/sisuroles`)
    res.send(data)
  } catch (e) {
    if (e.response) {
      const { response } = e
      logger.info(`Error fetching Sisu roles for person ${id}: ${response.status} ${response.data}`)
      return res.status(response.status).json(response.data)
    }
    throw new Error(`Error fetching Sisu roles for person ${id}: ${e.toString()}`)
  }
})

module.exports = router
