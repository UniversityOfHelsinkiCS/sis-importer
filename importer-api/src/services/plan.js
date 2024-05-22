const { APIS } = require('../config')
const { OSUVA_PLAN_CHANNEL } = require('../utils/stan')
const PLAN_SCHEDULE_ID = 'PLAN'

const info = {
  API: APIS.osuva,
  CHANNEL: OSUVA_PLAN_CHANNEL,
  REDIS_KEY: 'LATEST_PLAN_ORDINAL',
  API_URL: '/plans/v1/export'
}

module.exports = {
  PLAN_SCHEDULE_ID,
  info
}
