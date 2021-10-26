const router = require('express').Router()
const axios = require('axios').default
const fs = require('fs')
const https = require('https')

const models = require('../models')

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

router.get('/person/:personId', async (req, res) => {
  const { personId } = req.params

  const groups = await models.PersonGroup.findAll({
    where: {
      type: 'TUTORING_STUDENT_GROUP',
    },
    raw: true,
  })
  const groupsForPerson = groups.filter(group =>
    group.responsibilityInfos.some(
      role => role.personId === personId && role.roleUrn === 'urn:code:group-responsibility-info-type:responsible-tutor'
    )
  )

  const groupsById = groupsForPerson.reduce((acc, group) => {
    acc[group.id] = { ...group, members: [] }
    return acc
  }, {})

  const members = await Promise.all(
    groupsForPerson.map(async ({ id }) => {
      const { data } = await sisApi.get(`/ori/api/person-groups/v1/${id}/memberships`)
      return Promise.resolve(data)
    })
  )
  members.flat().forEach(member => groupsById[member.personGroupId].members.push(member))
  res.send(groupsById)
})

module.exports = router
