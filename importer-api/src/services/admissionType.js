const { APIS, KORI_PUBLIC_API_URL } = require('../config')
const { URN_ADMISSION_TYPE_CHANNEL } = require('../utils/stan')
const ADMISSION_TYPE_SCHEDULE_ID = 'ADMISSION_TYPE'

const info = {
  API: APIS.urn,
  CHANNEL: URN_ADMISSION_TYPE_CHANNEL,
  REDIS_KEY: ADMISSION_TYPE_SCHEDULE_ID,
  API_URL: `${KORI_PUBLIC_API_URL}/cached/codebooks/urn:code:admission-type`,
  ONETIME: true
}

module.exports = {
  ADMISSION_TYPE_SCHEDULE_ID,
  info
}
