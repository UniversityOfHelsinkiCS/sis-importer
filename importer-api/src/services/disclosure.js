const { APIS } = require('../config')
const { ORI_DISCLOSURE_CHANNEL } = require('../utils/stan')
const DISCLOSURE_SCHEDULE_ID = 'DISCLOSURE'

const info = {
  API: APIS.ori,
  CHANNEL: ORI_DISCLOSURE_CHANNEL,
  REDIS_KEY: 'LATEST_DISCLOSURE_ORDINAL',
  API_URL: '/disclosures/v1/export'
}

module.exports = {
  DISCLOSURE_SCHEDULE_ID,
  info
}
