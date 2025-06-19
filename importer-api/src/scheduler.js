const { oriRequest } = require('./utils/oriApi')
const { koriRequest } = require('./utils/koriApi')
const { koriPublicRequest } = require('./utils/koriApiPublic')
const { urnRequest } = require('./utils/urnApi')
const { ilmoRequest } = require('./utils/ilmoApi')
const { osuvaRequest } = require('./utils/osuvaApi')
const { graphqlRequest } = require('./utils/graphqlApi')
const { get: redisGet, del: redisDel } = require('./utils/redis')
const { services, serviceIds } = require('./services')
const { FETCH_AMOUNT, APIS } = require('./config')
const { logger } = require('./utils/logger')
const { chunk } = require('lodash')
const { queueEvents, queue, Job } = require('./utils/queue')
const { timed } = require('./utils/time')

const API_MAPPING = {
  [APIS.ori]: oriRequest,
  [APIS.kori]: koriRequest,
  [APIS.ilmo]: ilmoRequest,
  [APIS.osuva]: osuvaRequest,
  [APIS.urn]: urnRequest
}

queueEvents.on('failed', async ({ jobId }) => {
  const job = await Job.fromId(queue, jobId)

  const entities = job.data

  const parts = []
  if (entities.length >= 2) {
    const half = Math.round(entities.length / 2)
    parts.push(entities.splice(0, half))
    parts.push(entities.splice(half - 1, entities.length))
    logger.info('Splitting the job and trying again, ', {
      original: entities.length,
      part1: parts[0].length,
      part2: parts[1].length
    })
  } else {
    return
  }

  const { duration } = await timed(Promise.all(parts.map(part => queue.add(job.name, part))))
  logger.info({
    message: 'Requeued two jobs',
    timeMs: duration
  })
})

const fetchBy = async (api, url, ordinal, customRequest, limit = 1000, query) => {
  if (api === APIS.graphql) return graphqlRequest(query)
  if (api === APIS.custom) return customRequest(url)
  if (api === APIS.koriPublic) return koriPublicRequest(url)
  const targetUrl = url.endsWith('/export') ? `${url}?since=${ordinal}&limit=${limit}` : url
  return API_MAPPING[api](targetUrl)
}

const scheduleBMQ = async serviceId => {
  const { API, API_URL, REDIS_KEY, CHANNEL, customRequest, QUERY, GRAPHQL_KEY, ONETIME } = services[serviceId]

  const latestOrdinal = (await redisGet(REDIS_KEY)) || 0

  if (ONETIME && latestOrdinal > 0) return

  const {
    result: { hasMore, entities, greatestOrdinal },
    duration: fetchDuration
  } = await timed(
    fetchBy(API, API_URL, latestOrdinal, customRequest, FETCH_AMOUNT, {
      QUERY,
      GRAPHQL_KEY
    })
  )
  if (!entities || !entities.length) {
    logger.info(`No entities fetched from ${API_URL}`, {
      serviceId,
      channel: CHANNEL,
      timeMs: fetchDuration
    })
    return
  }

  logger.info(`Fetched ${entities.length} entities from ${API_URL}`, {
    serviceId,
    channel: CHANNEL,
    timeMs: fetchDuration
  })

  const jobs = chunk(entities, 1000).map(entityChunk => ({
    name: CHANNEL,
    data: entityChunk
  }))

  logger.info(`Queuing BMQ jobs for ${CHANNEL}`, {
    count: jobs.length
  })
  const { duration: queueDuration } = await timed(queue.addBulk(jobs))

  logger.info({
    message: `Queued ${serviceId} ${entities.length}`,
    count: entities.length,
    channel: CHANNEL,
    timeMs: queueDuration,
    serviceId
  })

  return API === APIS.custom ? null : { greatestOrdinal, hasMore, total: entities.length, ordinalKey: REDIS_KEY }
}

const resetOnetimeServices = async () => {
  const ids = serviceIds.filter(id => services[id].ONETIME)
  return Promise.all(ids.map(id => redisDel(services[id].REDIS_KEY)))
}

module.exports = {
  scheduleBMQ,
  resetOnetimeServices
}
