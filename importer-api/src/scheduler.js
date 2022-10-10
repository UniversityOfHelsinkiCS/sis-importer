const { eachLimit } = require('async')
const { stan, opts, SCHEDULER_STATUS_CHANNEL } = require('./utils/stan')
const { oriRequest } = require('./utils/oriApi')
const { koriRequest } = require('./utils/koriApi')
const { urnRequest } = require('./utils/urnApi')
const { ilmoRequest } = require('./utils/ilmoApi')
const { osuvaRequest } = require('./utils/osuvaApi')
const { graphqlRequest } = require('./utils/graphqlApi')
const { get: redisGet, set: redisSet, incrby: redisIncrementBy, del: redisDel } = require('./utils/redis')
const { services, serviceIds } = require('./services')
const { FETCH_AMOUNT, MAX_CHUNK_SIZE, APIS, PANIC_TIMEOUT } = require('./config')
const { logger } = require('./utils/logger')
const chunkify = require('./utils/chunkify')
const requestBuffer = require('./utils/requestBuffer')

const { successCounter } = require('./prom')

const API_MAPPING = {
  [APIS.ori]: oriRequest,
  [APIS.kori]: koriRequest,
  [APIS.ilmo]: ilmoRequest,
  [APIS.osuva]: osuvaRequest,
  [APIS.urn]: urnRequest
}

const fetchBy = async (api, url, ordinal, customRequest, limit = 1000, query) => {
  if (api === APIS.graphql) return graphqlRequest(query)
  const targetUrl = api == APIS.urn || api == APIS.custom ? url : `${url}?since=${ordinal}&limit=${limit}`

  if (api === APIS.custom) return customRequest(url)
  return API_MAPPING[api](targetUrl)
}

const updateServiceStatus = async (key, { updated = undefined, scheduled = undefined }) => {
  if (updated !== undefined) await redisSet(`${key}_UPDATED`, updated)
  if (scheduled !== undefined) await redisSet(`${key}_SCHEDULED`, scheduled)
}

const createJobs = async (channel, entities, executionHash) =>
  new Promise((res, rej) => {
    stan.publish(channel, JSON.stringify({ entities, executionHash }), err => {
      if (err) {
        logger.error({ message: err.message, meta: err.stack })
        return rej(err)
      }
      res()
    })
  })

const createJobsFromEntities = async (channel, entities, executionHash, chunks = MAX_CHUNK_SIZE) =>
  eachLimit(chunkify(entities, chunks), 5, async e => {
    await createJobs(channel, e, executionHash)
  })

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

      if (result) {
        logger.info({
          message: `Imported ${amount} ${serviceId}, ${result}/${amountScheduled}`,
          count: amount,
          done: result,
          total: amountScheduled,
          serviceId
        })
        successCounter.inc({ service: serviceId }, amount)
      }
      if (result === Number(amountScheduled)) {
        handleFinish()
        statusChannel.unsubscribe()
      }
      msg.ack()
    } catch (e) {
      logger.error({ message: 'Failed handling message', meta: e.stack })
    }
  })

  return statusChannel
}

const schedule = async (id, executionHash) => {
  const { API, API_URL, REDIS_KEY, CHANNEL, customRequest, QUERY, GRAPHQL_KEY, ONETIME } = services[id]
  let statusChannel

  return new Promise(async (resolve, reject) => {
    const latestOrdinal = (await redisGet(REDIS_KEY)) || 0

    if (ONETIME && latestOrdinal > 0) return resolve(null)

    try {
      const { hasMore, entities, greatestOrdinal } =
        (await requestBuffer.read()) ||
        (await fetchBy(API, API_URL, latestOrdinal, customRequest, FETCH_AMOUNT, { QUERY, GRAPHQL_KEY }))
      if (!entities || !entities.length) return resolve(null)

      await updateServiceStatus(REDIS_KEY, {
        scheduled: entities.length,
        updated: 0
      })

      const handleFinish = () =>
        resolve(
          API === APIS.custom ? null : { greatestOrdinal, hasMore, total: entities.length, ordinalKey: REDIS_KEY }
        )

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

      await createJobsFromEntities(CHANNEL, entities, executionHash)
      if (![APIS.urn, APIS.custom, APIS.graphql].includes(API)) {
        requestBuffer.fill(() => fetchBy(API, API_URL, greatestOrdinal, customRequest, FETCH_AMOUNT))
      }
    } catch (e) {
      if (statusChannel) statusChannel.unsubscribe()
      reject(e)
    }
  })
}

const resetOnetimeServices = async () => {
  const ids = serviceIds.filter(id => services[id].ONETIME)
  return Promise.all(ids.map(id => redisDel(services[id].REDIS_KEY)))
}

module.exports = {
  schedule,
  resetOnetimeServices
}
