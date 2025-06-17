const { APIS, ROOT_ORG_ID } = require('../config')
const { KORI_PUBLIC_CURRICULUM_PERIOD_CHANNEL } = require('../utils/channels')

const CURRICULUM_PERIOD_SCHEDULE_ID = 'CURRICULUM_PERIOD'

const info = {
  API: APIS.koriPublic,
  CHANNEL: KORI_PUBLIC_CURRICULUM_PERIOD_CHANNEL,
  REDIS_KEY: CURRICULUM_PERIOD_SCHEDULE_ID,
  API_URL: `/curriculum-periods?universityOrgId=${ROOT_ORG_ID}`,
  ONETIME: true
}

module.exports = {
  CURRICULUM_PERIOD_SCHEDULE_ID,
  info
}
