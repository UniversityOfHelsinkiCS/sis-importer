const { ORI_ATTAINMENTS_CHANNEL } = require('../utils/stan')
const ATTAINMENTS_SCHEDULE_ID = 'ATTAINMENTS'

const info = {
  CHANNEL: ORI_ATTAINMENTS_CHANNEL,
  LATEST_ORDINAL_KEY: 'LATEST_ATTAINMENTS_ORDINAL',
  API_URL: '/attainments/v1/export'
}

module.exports = {
  ATTAINMENTS_SCHEDULE_ID,
  info
}
