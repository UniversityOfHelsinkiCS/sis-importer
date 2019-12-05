const { set: redisSet } = require('./utils/redis')
const { randomBytes } = require('crypto')
const { PERSON_SCHEDULE_ID } = require('./services/person')
const { schedule } = require('./scheduler')
const { CURRENT_EXECUTION_HASH } = require('./config')
const { stan } = require('./utils/stan')

const SCHEDULE_IDS = [PERSON_SCHEDULE_ID]

if (process.env.NODE_ENV === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const updateOrdinalFrom = async (total, redisKey, ordinal) => {
  if (total) await redisSet(redisKey, ordinal)
}

const update = async (current, generatedHash) => {
  const SCHEDULE_ID = SCHEDULE_IDS[current]
  if (!SCHEDULE_ID) {
    console.log('finito!')
    return
  }
  const data = await schedule(SCHEDULE_ID, generatedHash)
  if (data) {
    const { greatestOrdinal, hasMore, total, ordinalKey } = data
    await updateOrdinalFrom(total, ordinalKey, greatestOrdinal)
    update(hasMore ? current : current + 1, generatedHash)
  } else {
    update(current + 1, generatedHash)
  }
}

const initialize = async () => {
  const generatedHash = randomBytes(12).toString('hex')
  await redisSet(CURRENT_EXECUTION_HASH, generatedHash)
  update(0, generatedHash)
}

stan.on('connect', () => {
  initialize()
})
