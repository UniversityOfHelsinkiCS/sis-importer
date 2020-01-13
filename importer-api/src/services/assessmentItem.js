const { APIS } = require('../config')
const { KORI_ASSESSMENT_ITEM_CHANNEL } = require('../utils/stan')
const ASSESSMENT_ITEM_SCHEDULE_ID = 'ASSESMENT_ITEM'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_ASSESSMENT_ITEM_CHANNEL,
  LATEST_ORDINAL_KEY: 'LATEST_ASSESSMENT_ORDINAL',
  API_URL: '/assessment-items/v1/export'
}

module.exports = {
  ASSESSMENT_ITEM_SCHEDULE_ID,
  info
}
