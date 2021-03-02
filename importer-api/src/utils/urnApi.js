const axios = require('axios')
const { retry } = require('./index')
const { get: redisGet, set: redisSet, expire: redisExpire } = require('./redis')

const toEntities = urnResult => ({
  // Provide an ordinal so redis gets populated for the service and onetime
  // services wont get run again
  greatestOrdinal: 1,
  hasMore: false,
  entities: Object.values(urnResult).map(urnItem => ({
    ...urnItem,
    id: urnItem.urn,
    documentState: 'ACTIVE'
  }))
})

const urnRequest = async url => {
  const redisHit = await redisGet(url)
  if (redisHit) {
    return toEntities(JSON.parse(redisHit))
  }

  const result = await retry(axios.get, [url])
  await redisSet(url, JSON.stringify(result.data))
  await redisExpire(url, 3600)
  return toEntities(result.data)
}

module.exports = {
  urnRequest
}
