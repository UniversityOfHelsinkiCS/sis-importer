const { APIS } = require('../config')
const { URN_COUNTRY_CHANNEL } = require('../utils/stan')
const COUNTRY_SCHEDULE_ID = 'COUNTRY'

const info = {
  API: APIS.urn,
  CHANNEL: URN_COUNTRY_CHANNEL,
  REDIS_KEY: COUNTRY_SCHEDULE_ID,
  API_URL: 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:country'
}

module.exports = {
  COUNTRY_SCHEDULE_ID,
  info
}
