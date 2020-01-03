const { APIS } = require('../config')
const { ORI_STUDY_RIGHTS_CHANNEL } = require('../utils/stan')
const STUDY_RIGHT_SCHEDULE_ID = 'STUDY_RIGHT'

const info = {
  API: APIS.ori,
  CHANNEL: ORI_STUDY_RIGHTS_CHANNEL,
  LATEST_ORDINAL_KEY: 'LATEST_STUDY_RIGHT_ORDINAL',
  API_URL: '/study-rights/v1/export'
}

module.exports = {
  STUDY_RIGHT_SCHEDULE_ID,
  info
}
