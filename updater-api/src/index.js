const { set: redisSet } = require('./utils/redis')
const { PERSON_SCHEDULE_ID } = require('./services/person')
const { schedule } = require('./scheduler')

if (process.env.NODE_ENV === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

/* const updateOrdinalFrom = async (data, redisKey) => {
  if (data.entities && data.entities.length) await redisSet(redisKey, data.greatestOrdinal)
} */

const initialize = async () => {
  await schedule(PERSON_SCHEDULE_ID)
}

initialize()
