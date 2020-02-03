const { APIS } = require('../config')
const { KORI_EDUCATION_CHANNEL } = require('../utils/stan')
const EDUCATION_SCHEDULE_ID = 'EDUCATION'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_EDUCATION_CHANNEL,
  REDIS_KEY: 'LATEST_EDUCATION_ORDINAL',
  API_URL: '/educations/v1/export'
}

module.exports = {
  EDUCATION_SCHEDULE_ID,
  info
}
