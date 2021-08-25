const router = require('express').Router()
const axios = require('axios').default
const fs = require('fs')
const https = require('https')

const { SIS_API_URL, PROXY_TOKEN, OODIKONE_KEY_PATH, OODIKONE_CERT_PATH, OODIKONE_API_KEY } = process.env

const hasCerts = OODIKONE_KEY_PATH && OODIKONE_CERT_PATH

const getHeaders = () => {
  if (!hasCerts) return { token: PROXY_TOKEN || '' }
  else if (hasCerts && OODIKONE_API_KEY) return { 'X-Api-Key': OODIKONE_API_KEY }
  return {}
}

const agent = hasCerts
  ? new https.Agent({
      cert: fs.readFileSync(OODIKONE_CERT_PATH, 'utf8'),
      key: fs.readFileSync(OODIKONE_KEY_PATH, 'utf8'),
    })
  : new https.Agent()

const sisApi = axios.create({
  baseURL: SIS_API_URL,
  headers: getHeaders(),
  httpsAgent: agent,
})

router.get('/:id/memberships', async (req, res) => {
  const { id } = req.params
  const { data } = await sisApi.get(`/ori/api/person-groups/v1/${id}/memberships`)
  res.send(data)
})

module.exports = router
