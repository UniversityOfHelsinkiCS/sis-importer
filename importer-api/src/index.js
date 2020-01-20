const { set: redisSet } = require('./utils/redis')
const { randomBytes } = require('crypto')
const { serviceIds } = require('./services')
const { schedule } = require('./scheduler')
const { SONIC, REJECT_UNAUTHORIZED, IS_DEV, CURRENT_EXECUTION_HASH, UPDATE_RETRY_LIMIT } = require('./config')
const { stan } = require('./utils/stan')
const { schedule: scheduleCron } = require('./utils/cron')
const { sleep } = require('./utils')

let isUpdating = false

if (REJECT_UNAUTHORIZED) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const updateOrdinalFrom = async (total, redisKey, ordinal) => {
  if (total) await redisSet(redisKey, ordinal)
}

const updateHash = async () => {
  const generatedHash = randomBytes(12).toString('hex')
  await redisSet(CURRENT_EXECUTION_HASH, generatedHash)
  return generatedHash
}

const update = async (current, attempt = 1) => {
  if (IS_DEV && !SONIC) {
    await sleep(1000)
  }
  const generatedHash = await updateHash()
  const serviceId = serviceIds[current]
  if (!serviceId) {
    console.log('Updating finished')
    isUpdating = false
    return
  }
  console.log(`Updating ${serviceId}`)
  try {
    const data = await schedule(serviceId, generatedHash)
    if (data) {
      const { greatestOrdinal, hasMore, total, ordinalKey } = data
      console.log(`New ordinal for ${serviceId}: ${greatestOrdinal}`)
      await updateOrdinalFrom(total, ordinalKey, greatestOrdinal)
      update(hasMore ? current : current + 1)
    } else {
      update(current + 1)
    }
  } catch (e) {
    if (attempt === UPDATE_RETRY_LIMIT) {
      console.log('Updating failed', e)
      isUpdating = false
      return
    }
    update(current, ++attempt)
  }
}

const run = async () => {
  if (!isUpdating) {
    isUpdating = true
    update(0)
  }
}

stan.on('connect', ({ clientID }) => {
  console.log(`Connecting to NATS as ${clientID}...`)
  scheduleCron(IS_DEV || SONIC ? '* * * * * *' : '*/30 * * * *', run)
})
