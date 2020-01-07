const { APIS } = require('../config')
const { KORI_MODULE_CHANNEL } = require('../utils/stan')
const MODULE_SCHEDULE_ID = 'MODULE'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_MODULE_CHANNEL,
  LATEST_ORDINAL_KEY: 'LATEST_MODULE_ORDINAL',
  API_URL: '/modules/v1/export'
}

module.exports = {
  MODULE_SCHEDULE_ID,
  info
}
