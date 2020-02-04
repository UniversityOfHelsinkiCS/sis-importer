const { APIS } = require('../config')
const { CUSTOM_GRADE_SCALE_CHANNEL } = require('../utils/stan')
const { koriRequest } = require('../utils/koriApi')
const GRADE_SCALE_SCHEDULE_ID = 'GRADE_SCALE'

const info = {
  API: APIS.custom,
  CHANNEL: CUSTOM_GRADE_SCALE_CHANNEL,
  REDIS_KEY: GRADE_SCALE_SCHEDULE_ID,
  API_URL: '/grade-scales',
  customRequest: async url => {
    const grades = await koriRequest(url)
    return { entities: grades }
  }
}

module.exports = {
  GRADE_SCALE_SCHEDULE_ID,
  info
}
