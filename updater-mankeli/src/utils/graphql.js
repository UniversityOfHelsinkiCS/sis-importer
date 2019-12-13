const { GraphQLClient } = require('graphql-request')
const sleep = require('./sleep')
const { SIS_API_URL, SIS_TOKEN, PROXY_TOKEN } = process.env

const BASE_URL = `${SIS_API_URL}/graphql`
const API_URL = process.env.NODE_ENV === 'development' ? `${BASE_URL}?token=${PROXY_TOKEN}` : BASE_URL

const api = new GraphQLClient(API_URL, {
  headers: {
    ...(SIS_TOKEN ? { Authorization: `Application ${SIS_TOKEN}` } : {})
  }
})

const request = async (query, variables) => {
  if (SIS_API_URL) {
    const data = await api.rawRequest(query, variables)
    return data
  }
}

const queryWrapper = async (query, variables, retry = 6) => {
  for (let i = 1; i <= retry; i++) {
    try {
      const res = await request(query, variables)
      return res.data
    } catch (e) {
      if (i === retry) {
        console.log(`Request failed!`)
        console.log('query', query)
        console.log('variables', variables)
        throw e
      }
      console.log(`Retrying ${i}/${retry - 1} for ${query}`)
      await sleep(i * 1000)
    }
  }
}

module.exports = {
  queryWrapper
}
