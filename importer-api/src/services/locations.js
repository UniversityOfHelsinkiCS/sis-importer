const { APIS } = require('../config')
const { KORI_LOCATION_CHANNEL } = require('../utils/stan')
const LOCATION_SCHEDULE_ID = 'LOCATION'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_LOCATION_CHANNEL,
  REDIS_KEY: 'LATEST_LOCATION_ORDINAL',
  API_URL: '/locations/v1/export'
}

module.exports = {
  LOCATION_SCHEDULE_ID,
  info
}
