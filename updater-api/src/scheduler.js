const { request } = require('./utils/oriApi')
const { get: redisGet, set: redisSet } = require('./utils/redis')
const { PERSON_SCHEDULE_ID, info: personInfo } = require('./services/person')

const services = {
  [PERSON_SCHEDULE_ID]: personInfo
}

const fetchByOrdinal = async (url, ordinal, limit = 1000) => {
  return await request(`${url}?since=${ordinal}&limit=${limit}`)
}

const updateOrdinalStatus = async (key, { ordinal, passedCount, totalCount }) => {
  await redisSet(key, JSON.stringify({ ordinal, passedCount, totalCount }))
}

const createJobsFromEntities = async (id, entities) => {
  console.log('id', id)
  console.log('entities', entities)
}

const schedule = async id => {
  const { API_URL, LATEST_ORDINAL_KEY, ID } = services[id]
  const ordinalFromRedis = await redisGet(LATEST_ORDINAL_KEY)
  const latestOrdinal = ordinalFromRedis ? JSON.parse(ordinalFromRedis) : { ordinal: 0 }

  const { /* hasMore, */ entities /* greatestOrdinal */ } = await fetchByOrdinal(API_URL, latestOrdinal.ordinal, 2)
  await updateOrdinalStatus(LATEST_ORDINAL_KEY, {
    ordinal: latestOrdinal.ordinal,
    passedCount: 0,
    totalCount: entities.length
  })

  // Create jobs
  await createJobsFromEntities(ID, entities)

  // Track that all jobs are successful

  // Return next ordinal?
}

module.exports = {
  schedule
}
