const { APIS, KORI_PUBLIC_API_URL } = require('../config')
const { URN_COUNTRY_CHANNEL } = require('../utils/channels')
const COUNTRY_SCHEDULE_ID = 'COUNTRY'

const info = {
  API: APIS.urn,
  CHANNEL: URN_COUNTRY_CHANNEL,
  REDIS_KEY: COUNTRY_SCHEDULE_ID,
  API_URL: `${KORI_PUBLIC_API_URL}/cached/codebooks/urn:code:country`,
  ONETIME: true
}

module.exports = {
  COUNTRY_SCHEDULE_ID,
  info
}
