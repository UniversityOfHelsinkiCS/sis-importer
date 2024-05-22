const fs = require('fs')
const axios = require('axios')
const https = require('https')

const SisClient = require('./SisClient')
const SisGraphqlClient = require('./SisGraphqlClient')
const logger = require('../logger')

const { SIS_GRAPHQL_API_URL, SIS_GRAPHQL_API_TOKEN, KEY_PATH, CERT_PATH } = process.env

const createGraphqlHttpClient = () => {
  const hasCerts = CERT_PATH && KEY_PATH

  logger.info(`Using SIS GraphQL API in URL ${SIS_GRAPHQL_API_URL}`)

  logger.info(
    hasCerts
      ? 'Found SIS certs, using authorized HTTPS Agent'
      : 'SIS certs not found, using the unauthorized HTTPS Agent'
  )

  const agent = hasCerts
    ? new https.Agent({
        cert: fs.readFileSync(CERT_PATH, 'utf8'),
        key: fs.readFileSync(KEY_PATH, 'utf8')
      })
    : new https.Agent({
        rejectUnauthorized: false
      })

  return axios.create({
    baseURL: SIS_GRAPHQL_API_URL,
    httpsAgent: agent
  })
}

const graphqlClient = new SisGraphqlClient({
  httpClient: createGraphqlHttpClient(),
  token: SIS_GRAPHQL_API_TOKEN // For development purposes when used with proxy
})

const sisClient = new SisClient({
  graphqlClient
})

module.exports = sisClient
