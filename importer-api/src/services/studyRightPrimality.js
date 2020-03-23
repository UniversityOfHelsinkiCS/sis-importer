const { APIS } = require('../config')
const { ORI_STUDY_RIGHT_PRIMALITY_CHANNEL } = require('../utils/stan')
const STUDY_RIGHT_PRIMALITY_SCHEDULE_ID = 'STUDY_RIGHT_PRIMALITY'

const info = {
  API: APIS.ori,
  CHANNEL: ORI_STUDY_RIGHT_PRIMALITY_CHANNEL,
  REDIS_KEY: 'LATEST_STUDY_RIGHT_PRIMALITY_ORDINAL',
  API_URL: '/study-right-primalities/v1/export'
}

module.exports = {
  STUDY_RIGHT_PRIMALITY_SCHEDULE_ID,
  info
}
