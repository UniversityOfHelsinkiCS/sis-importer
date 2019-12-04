const { chunk } = require('lodash')
const { stan } = require('./utils/stan')
const { request } = require('./utils/oriApi')
const { get: redisGet, set: redisSet, sadd: redisSetAdd } = require('./utils/redis')
const { PERSON_SCHEDULE_ID, info: personInfo } = require('./services/person')

const services = {
  [PERSON_SCHEDULE_ID]: personInfo
}

const fetchByOrdinal = async (url, ordinal, limit = 1000) => {
  return await request(`${url}?since=${ordinal}&limit=${limit}`)
}

const updateOrdinalStatus = async (
  key,
  { ordinal = undefined, updated = [], scheduled = [], greatestOrdinal = undefined, hasMore = undefined, executionHash }
) => {
  await redisSet(`${key}_EXECUTION_HASH`, executionHash)
  if (ordinal !== undefined) await redisSet(key, ordinal)
  if (greatestOrdinal !== undefined) await redisSet(`${key}_GREATEST_ORDINAL`, greatestOrdinal)
  if (hasMore !== undefined) await redisSet(`${key}_HAS_MORE`, hasMore)
  if (updated.length) await redisSetAdd(`${key}_UPDATED`, updated)
  if (scheduled.length) await redisSetAdd(`${key}_SCHEDULED`, scheduled)
}

const createJobsFromEntities = async (channel, entities, executionHash) => {
  chunk(entities, 100).forEach(c => {
    stan.publish(channel, JSON.stringify({ entities, executionHash }), (err) => {
      if (err) console.log('failed publishing', err)
    })
  })
}

const schedule = async (id, executionHash) => {
  const { API_URL, LATEST_ORDINAL_KEY, CHANNEL } = services[id]
  const latestOrdinal = (await redisGet(LATEST_ORDINAL_KEY)) || 0

  const { hasMore, entities, greatestOrdinal } = await fetchByOrdinal(API_URL, latestOrdinal, 1000)
  await updateOrdinalStatus(LATEST_ORDINAL_KEY, {
    ordinal: latestOrdinal,
    scheduled: entities.map(({ id }) => id),
    updated: [],
    greatestOrdinal,
    hasMore,
    executionHash
  })

  // Create jobs
  await createJobsFromEntities(CHANNEL, entities, executionHash)
}

module.exports = {
  schedule
}
