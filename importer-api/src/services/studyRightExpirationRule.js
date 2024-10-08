const { APIS, KORI_PUBLIC_API_URL } = require('../config')
const { URN_STUDY_RIGHT_EXPIRATION_RULE_CHANNEL } = require('../utils/stan')
const STUDY_RIGHT_EXPIRATION_RULE_SCHEDULE_ID = 'STUDY_RIGHT_EXPIRATION_RULE'

const info = {
  API: APIS.urn,
  CHANNEL: URN_STUDY_RIGHT_EXPIRATION_RULE_CHANNEL,
  REDIS_KEY: STUDY_RIGHT_EXPIRATION_RULE_SCHEDULE_ID,
  API_URL: `${KORI_PUBLIC_API_URL}/cached/codebooks/urn:code:study-right-expiration-rules`,
  ONETIME: true
}

module.exports = {
  STUDY_RIGHT_EXPIRATION_RULE_SCHEDULE_ID,
  info
}
