const { APIS } = require('../config')
const { ORI_ATTAINMENT_CHANNEL } = require('../utils/channels')
const ATTAINMENT_SCHEDULE_ID = 'ATTAINMENT'

const info = {
  API: APIS.ori,
  CHANNEL: ORI_ATTAINMENT_CHANNEL,
  REDIS_KEY: 'LATEST_ATTAINMENT_ORDINAL',
  API_URL: '/attainments/v1/export'
}

module.exports = {
  ATTAINMENT_SCHEDULE_ID,
  info
}
