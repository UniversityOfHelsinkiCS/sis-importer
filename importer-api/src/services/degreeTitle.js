const { APIS, KORI_PUBLIC_API_URL } = require('../config')
const { URN_DEGREE_TITLE_CHANNEL } = require('../utils/stan')
const DEGREE_TITLE_SCHEDULE_ID = 'DEGREE_TITLE'

const info = {
  API: APIS.urn,
  CHANNEL: URN_DEGREE_TITLE_CHANNEL,
  REDIS_KEY: DEGREE_TITLE_SCHEDULE_ID,
  API_URL: `${KORI_PUBLIC_API_URL}/cached/codebooks/urn:code:degree-title`,
  ONETIME: true
}

module.exports = {
  DEGREE_TITLE_SCHEDULE_ID,
  info
}
