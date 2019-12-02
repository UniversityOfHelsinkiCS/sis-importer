const { GraphQLClient } = require('graphql-request')
const { SIS_API_URL, SIS_TOKEN, PROXY_TOKEN } = process.env

if (process.env.NODE_ENV === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const API_URL = process.env.NODE_ENV === 'development' ? `${SIS_API_URL}?token=${PROXY_TOKEN}` : SIS_API_URL

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

module.exports = {
  request
}
