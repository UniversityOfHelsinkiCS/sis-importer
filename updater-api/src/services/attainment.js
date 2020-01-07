const { APIS } = require('../config')
const { ORI_ATTAINMENT_CHANNEL } = require('../utils/stan')
const ATTAINMENT_SCHEDULE_ID = 'ATTAINMENT'

const info = {
  API: APIS.ori,
  CHANNEL: ORI_ATTAINMENT_CHANNEL,
  LATEST_ORDINAL_KEY: 'LATEST_ATTAINMENT_ORDINAL',
  API_URL: '/attainments/v1/export'
}

module.exports = {
  ATTAINMENT_SCHEDULE_ID,
  info
}
