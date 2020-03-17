const { chunk } = require('lodash')
const { stan, opts, SCHEDULER_STATUS_CHANNEL } = require('./utils/stan')
const { oriRequest } = require('./utils/oriApi')
const { koriRequest } = require('./utils/koriApi')
const { urnRequest } = require('./utils/urnApi')
const { get: redisGet, set: redisSet, incrby: redisIncrementBy } = require('./utils/redis')
const { services } = require('./services')
const { FETCH_AMOUNT, DEFAULT_CHUNK_SIZE, APIS, PANIC_TIMEOUT } = require('./config')
const { logger } = require('./utils/logger')

const fetchBy = async (api, url, ordinal, customRequest, limit = 1000) => {
  if (api === APIS.urn) return urnRequest(url)
  if (api === APIS.custom) return customRequest(url)

  const targetUrl = `${url}?since=${ordinal}&limit=${limit}`
  return await (api === APIS.ori ? oriRequest(targetUrl) : koriRequest(targetUrl))
}

const updateServiceStatus = async (key, { updated = undefined, scheduled = undefined }) => {
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

const initializeStatusChannel = (channel, ordinalKey, executionHash, handleFinish, serviceId) => {
  const statusChannel = stan.subscribe(SCHEDULER_STATUS_CHANNEL, opts)
  statusChannel.on('message', async msg => {
    try {
      const { channel: msgChannel, status, entities, amount, executionHash: msgExecutionHash, stack } = JSON.parse(
        msg.getData()
      )
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
          logger.error({ message: 'Importing entity failed', meta: stack })
          result = await redisIncrementBy(`${ordinalKey}_UPDATED`, entities.length)
        }
      }

      if (result) logger.info({ message: 'Imported', count: amount, done: result, total: amountScheduled, serviceId })
      if (result === Number(amountScheduled)) {
        handleFinish()
        statusChannel.unsubscribe()
      }
      msg.ack()
    } catch (e) {
      console.log('Failed handling message', e)
    }
  })

  return statusChannel
}

const schedule = async (id, executionHash) => {
  const { API, API_URL, REDIS_KEY, CHANNEL, customRequest } = services[id]
  let statusChannel

  return new Promise(async (resolve, reject) => {
    const latestOrdinal = (await redisGet(REDIS_KEY)) || 0

    try {
      const { hasMore, entities, greatestOrdinal } = await fetchBy(
        API,
        API_URL,
        latestOrdinal,
        customRequest,
        FETCH_AMOUNT
      )
      if (!entities || !entities.length) return resolve(null)

      await updateServiceStatus(REDIS_KEY, {
        scheduled: entities.length,
        updated: 0
      })

      const handleFinish = () => {
        resolve(
          [APIS.urn, APIS.custom].includes(API)
            ? null
            : { greatestOrdinal, hasMore, total: entities.length, ordinalKey: REDIS_KEY }
        )
      }

      statusChannel = initializeStatusChannel(CHANNEL, REDIS_KEY, executionHash, handleFinish, id)

      const panicTimeout = setTimeout(() => {
        statusChannel.unsubscribe()
        reject(`No response for ${PANIC_TIMEOUT}ms`)
      }, PANIC_TIMEOUT)

      statusChannel.on('error', e => {
        reject(e)
      })

      statusChannel.on('unsubscribed', () => {
        clearTimeout(panicTimeout)
      })

      createJobsFromEntities(CHANNEL, entities, executionHash)
    } catch (e) {
      if (statusChannel) statusChannel.unsubscribe()
      reject(e)
    }
  })
}

module.exports = {
  schedule
}
