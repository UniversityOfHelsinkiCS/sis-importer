const axios = require('axios').default

const { request } = require('./index')

const toEntities = data => ({
  entities: data,
  // Provide an ordinal so redis gets populated for the service and onetime
  // services wont get run again
  greatestOrdinal: 1,
  hasMore: false
})

const koriPublicInstance = axios.create({
  baseURL: 'https://sisu.helsinki.fi/kori/api'
})

const koriPublicRequest = async path => {
  const data = await request(koriPublicInstance, path)
  return toEntities(data)
}

module.exports = {
  koriPublicRequest
}