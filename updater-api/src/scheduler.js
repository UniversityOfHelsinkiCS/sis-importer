const { chunk } = require('lodash')
const { stan, opts, SCHEDULER_STATUS_CHANNEL } = require('./utils/stan')
const { oriRequest } = require('./utils/oriApi')
const { koriRequest } = require('./utils/koriApi')
const { get: redisGet, set: redisSet, incrby: redisIncrementBy } = require('./utils/redis')
const { services } = require('./services')
const { FETCH_AMOUNT, DEFAULT_CHUNK_SIZE, APIS, PANIC_TIMEOUT } = require('./config')

const fetchByOrdinal = async (api, url, ordinal, limit = 1000) => {
  const targetUrl = `${url}?since=${ordinal}&limit=${limit}`
  return await (api === APIS.ori ? oriRequest(targetUrl) : koriRequest(targetUrl))
}

const updateOrdinalStatus = async (key, { ordinal = undefined, updated = undefined, scheduled = undefined }) => {
  if (ordinal !== undefined) await redisSet(key, ordinal)
  if (updated !== undefined) await redisSet(`${key}_UPDATED`, updated)
  if (scheduled !== undefined) await redisSet(`${key}_SCHEDULED`, scheduled)
}

const createJobsFromEntities = async (channel, entities, executionHash, chunks = DEFAULT_CHUNK_SIZE) => {
  chunk(entities, chunks).forEach(c => {
    stan.publish(channel, JSON.stringify({ entities: c, executionHash }), err => {
      if (err) console.log('failed publishing', err)
    })
  })
}

const initializeStatusChannel = (channel, ordinalKey, executionHash, handleFinish) => {
  const statusChannel = stan.subscribe(SCHEDULER_STATUS_CHANNEL, opts)
  statusChannel.on('message', async msg => {
    const { channel: msgChannel, status, entities, amount, executionHash: msgExecutionHash } = JSON.parse(msg.getData())
    const amountScheduled = await redisGet(`${ordinalKey}_SCHEDULED`)

    if (msgExecutionHash !== executionHash || channel !== msgChannel) {
      msg.ack()
      return
    }

    let result
    if (status === 'OK') {
      result = await redisIncrementBy(`${ordinalKey}_UPDATED`, amount)
    } else if (status === 'FAIL') {
      if (entities.length > 1) {
        await createJobsFromEntities(channel, entities, executionHash, Math.ceil(entities.length / 2))
      } else {
        // Log error to sentry?
        console.log('Failed multiple times')
        result = await redisIncrementBy(`${ordinalKey}_UPDATED`, entities.length)
      }
    }

    if (result) console.log(`${result}/${amountScheduled}`)
    if (result === Number(amountScheduled)) {
      handleFinish()
      statusChannel.unsubscribe()
    }
    msg.ack()
  })

  return statusChannel
}

const schedule = async (id, executionHash) => {
  const { API, API_URL, LATEST_ORDINAL_KEY, CHANNEL } = services[id]

  return new Promise(async (resolve, reject) => {
    const latestOrdinal = (await redisGet(LATEST_ORDINAL_KEY)) || 0

    try {
      const { hasMore, entities, greatestOrdinal } = await fetchByOrdinal(API, API_URL, latestOrdinal, FETCH_AMOUNT)
      if (!entities || !entities.length) return resolve(null)

      await updateOrdinalStatus(LATEST_ORDINAL_KEY, {
        ordinal: latestOrdinal,
        scheduled: entities.length,
        updated: 0
      })

      const handleFinish = () => {
        resolve({ greatestOrdinal, hasMore, total: entities.length, ordinalKey: LATEST_ORDINAL_KEY })
      }

      const statusChannel = initializeStatusChannel(CHANNEL, LATEST_ORDINAL_KEY, executionHash, handleFinish)

      const panicTimeout = setTimeout(() => {
        statusChannel.unsubscribe()
        reject(`No response for ${PANIC_TIMEOUT}ms`)
      }, PANIC_TIMEOUT)

      statusChannel.on('unsubscribed', () => {
        clearTimeout(panicTimeout)
      })

      createJobsFromEntities(CHANNEL, entities, executionHash)
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  schedule
}
