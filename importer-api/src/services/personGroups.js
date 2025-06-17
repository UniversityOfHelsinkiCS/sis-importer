const { APIS } = require('../config')
const PERSON_GROUP_SCHEDULE_ID = 'PERSON_GROUP'

const info = {
  API: APIS.ori,
  CHANNEL: 'ORI_PERSON_GROUP_CHANNEL',
  REDIS_KEY: 'LATEST_PERSON_GROUP_ORDINAL',
  API_URL: '/person-groups/v1/export'
}

module.exports = {
  PERSON_GROUP_SCHEDULE_ID,
  info
}
