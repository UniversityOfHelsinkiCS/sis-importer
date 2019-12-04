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

const createJobsFromEntities = async (id, entities) => {
  console.log(id, entities)
}

const schedule = async (id, executionHash) => {
  const { API_URL, LATEST_ORDINAL_KEY, ID } = services[id]
  const latestOrdinal = (await redisGet(LATEST_ORDINAL_KEY)) || 0

  const { hasMore, entities, greatestOrdinal } = await fetchByOrdinal(API_URL, latestOrdinal, 2)
  await updateOrdinalStatus(LATEST_ORDINAL_KEY, {
    ordinal: latestOrdinal,
    scheduled: entities.map(({ id }) => id),
    updated: [],
    greatestOrdinal,
    hasMore,
    executionHash
  })

  // Create jobs
  await createJobsFromEntities(ID, entities)
}

module.exports = {
  schedule
}
