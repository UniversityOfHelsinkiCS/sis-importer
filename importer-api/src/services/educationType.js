const { APIS } = require('../config')
const { URN_EDUCATION_TYPE_CHANNEL } = require('../utils/stan')
const EDUCATION_TYPE_SCHEDULE_ID = 'EDUCATION_TYPE'

const info = {
  API: APIS.urn,
  CHANNEL: URN_EDUCATION_TYPE_CHANNEL,
  REDIS_KEY: EDUCATION_TYPE_SCHEDULE_ID,
  API_URL: 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:education-type'
}

module.exports = {
  EDUCATION_TYPE_SCHEDULE_ID,
  info
}
