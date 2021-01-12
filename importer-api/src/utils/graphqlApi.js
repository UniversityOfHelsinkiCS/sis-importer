const axios = require('axios').default
const fs = require('fs')
const https = require('https')
const { retry } = require('./index')
const { SIS_API_URL, PROXY_TOKEN, KEY_PATH, CERT_PATH, API_KEY } = process.env

const hasCerts = KEY_PATH && CERT_PATH

const getHeaders = () => {
  if (!hasCerts) return { token: PROXY_TOKEN }
  else if (hasCerts && API_KEY) return { 'X-Api-Key': API_KEY }
  return {}
}

const agent = hasCerts
  ? new https.Agent({
      cert: fs.readFileSync(CERT_PATH, 'utf8'),
      key: fs.readFileSync(KEY_PATH, 'utf8')
    })
  : new https.Agent()

const graphqlInstance = axios.create({
  baseURL: `${SIS_API_URL}/graphql`,
  headers: getHeaders(),
  httpsAgent: agent
})

const toEntities = (queryResult, queryResultKey) => ({
  entities: queryResult[queryResultKey],
  // Provide an ordinal so redis gets populated for the service and onetime
  // services wont get run again
  greatestOrdinal: 1,
  hasMore: false
})

const graphqlRequest = async ({ QUERY: query, GRAPHQL_KEY, variables = {} }) => {
  const result = await retry(graphqlInstance.post, ['', { query, variables }])
  const { data } = result
  return toEntities(data.data, GRAPHQL_KEY)
}

module.exports = {
  graphqlRequest
}
