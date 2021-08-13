const { APIS } = require('../config')
const { URN_EDUCATION_CLASSIFICATION_CHANNEL } = require('../utils/stan')
const EDUCATION_CLASSIFICATION_SCHEDULE_ID = 'EDUCATION_CLASSIFICATION'

const info = {
  API: APIS.urn,
  CHANNEL: URN_EDUCATION_CLASSIFICATION_CHANNEL,
  REDIS_KEY: EDUCATION_CLASSIFICATION_SCHEDULE_ID,
  API_URL: 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:education-classification',
  ONETIME: true
}

module.exports = {
  EDUCATION_CLASSIFICATION_SCHEDULE_ID,
  info
}
