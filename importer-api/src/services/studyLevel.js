const { APIS } = require('../config')
const { URN_STUDY_LEVEL_CHANNEL } = require('../utils/stan')
const STUDY_LEVEL_SCHEDULE_ID = 'STUDY_LEVEL'

const info = {
  API: APIS.urn,
  CHANNEL: URN_STUDY_LEVEL_CHANNEL,
  REDIS_KEY: STUDY_LEVEL_SCHEDULE_ID,
  API_URL: 'https://sis-helsinki-test.funidata.fi/kori/api/cached/codebooks/urn:code:study-level',
  ONETIME: true
}

module.exports = {
  STUDY_LEVEL_SCHEDULE_ID,
  info
}
