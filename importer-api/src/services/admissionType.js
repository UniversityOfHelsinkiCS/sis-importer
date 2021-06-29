const { APIS } = require('../config')
const { URN_ADMISSION_TYPE_CHANNEL } = require('../utils/stan')
const ADMISSION_TYPE_SCHEDULE_ID = 'ADMISSION_TYPE'

const info = {
  API: APIS.urn,
  CHANNEL: URN_ADMISSION_TYPE_CHANNEL,
  REDIS_KEY: ADMISSION_TYPE_SCHEDULE_ID,
  API_URL: 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:admission-type',
  ONETIME: true
}

module.exports = {
  ADMISSION_TYPE_SCHEDULE_ID,
  info
}
