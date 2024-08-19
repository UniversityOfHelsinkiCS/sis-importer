const { APIS, KORI_API_URL } = require('../config')
const { URN_EDUCATION_TYPE_CHANNEL } = require('../utils/stan')
const EDUCATION_TYPE_SCHEDULE_ID = 'EDUCATION_TYPE'

const info = {
  API: APIS.urn,
  CHANNEL: URN_EDUCATION_TYPE_CHANNEL,
  REDIS_KEY: EDUCATION_TYPE_SCHEDULE_ID,
  API_URL: `${KORI_API_URL}/cached/codebooks/urn:code:education-type`,
  ONETIME: true
}

module.exports = {
  EDUCATION_TYPE_SCHEDULE_ID,
  info
}
