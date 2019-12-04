const { set: redisSet } = require('./utils/redis')
const { randomBytes } = require('crypto')
const { PERSON_SCHEDULE_ID } = require('./services/person')
const { schedule } = require('./scheduler')
const { CURRENT_EXECUTION_HASH } = require('./config')

if (process.env.NODE_ENV === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

/* const updateOrdinalFrom = async (data, redisKey) => {
  if (data.entities && data.entities.length) await redisSet(redisKey, data.greatestOrdinal)
} */

const initialize = async () => {
  const generatedHash = randomBytes(12).toString('hex')
  await redisSet(CURRENT_EXECUTION_HASH, generatedHash)
  console.log('CURRENT_EXECUTION_HASH', generatedHash)
  await schedule(PERSON_SCHEDULE_ID, generatedHash)
}

initialize()
