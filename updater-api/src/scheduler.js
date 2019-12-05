const { chunk } = require('lodash')
const { stan, opts } = require('./utils/stan')
const { request } = require('./utils/oriApi')
const { get: redisGet, set: redisSet, incrby: redisIncrementBy } = require('./utils/redis')
const { PERSON_SCHEDULE_ID, info: personInfo } = require('./services/person')
const { FETCH_AMOUNT } = require('./config')

const services = {
  [PERSON_SCHEDULE_ID]: personInfo
}

const fetchByOrdinal = async (url, ordinal, limit = 1000) => {
  return await request(`${url}?since=${ordinal}&limit=${limit}`)
}

const updateOrdinalStatus = async (
  key,
  { ordinal = undefined, updated = undefined, scheduled = undefined, executionHash }
) => {
  await redisSet(`${key}_EXECUTION_HASH`, executionHash)
  if (ordinal !== undefined) await redisSet(key, ordinal)
  if (updated !== undefined) await redisSet(`${key}_UPDATED`, updated)
  if (scheduled !== undefined) await redisSet(`${key}_SCHEDULED`, scheduled)
}

const createJobsFromEntities = async (channel, entities, executionHash, chunks = 100) => {
  chunk(entities, chunks).forEach(c => {
    stan.publish(channel, JSON.stringify({ entities: c, executionHash }), err => {
      if (err) console.log('failed publishing', err)
    })
  })
}

const initializeStatusChannel = (channel, ordinalKey, executionHash) => {
  const statusChannel = stan.subscribe(`${channel}_STATUS`, opts)
  statusChannel.on('message', async msg => {
    const { status, entities, executionHash: msgExecutionHash } = JSON.parse(msg.getData())
    const amountScheduled = await redisGet(`${ordinalKey}_SCHEDULED`)

    if (msgExecutionHash !== executionHash) {
      msg.ack()
      return
    }

    let result
    if (status === 'OK') {
      result = await redisIncrementBy(`${ordinalKey}_UPDATED`, entities.length)
    } else if (status === 'FAIL') {
      if (entities.length > 1) {
        await createJobsFromEntities(channel, entities, executionHash, Math.floor(entities.length / 2))
      } else {
        // Log error to sentry?
        console.log('Failed multiple times')
        result = await redisIncrementBy(`${ordinalKey}_UPDATED`, entities.length)
      }
    }
    if (result) console.log(result)
    if (result === Number(amountScheduled)) statusChannel.unsubscribe()
    msg.ack()
  })
  return statusChannel
}

const schedule = async (id, executionHash) => {
  return new Promise(async resolve => {
    const { API_URL, LATEST_ORDINAL_KEY, CHANNEL } = services[id]
    const latestOrdinal = (await redisGet(LATEST_ORDINAL_KEY)) || 0

    const { hasMore, entities, greatestOrdinal } = await fetchByOrdinal(API_URL, latestOrdinal, FETCH_AMOUNT)
    if (!entities || !entities.length) return resolve(null)

    await updateOrdinalStatus(LATEST_ORDINAL_KEY, {
      ordinal: latestOrdinal,
      scheduled: entities.length,
      updated: 0,
      executionHash
    })

    // Listen for success & fails
    const statusChannel = initializeStatusChannel(CHANNEL, LATEST_ORDINAL_KEY, executionHash)

    statusChannel.on('unsubscribed', function() {
      resolve({ greatestOrdinal, hasMore, total: entities.length, ordinalKey: LATEST_ORDINAL_KEY })
    })

    // Create initial jobs
    await createJobsFromEntities(CHANNEL, entities, executionHash, 100)
  })
}

module.exports = {
  schedule
}
