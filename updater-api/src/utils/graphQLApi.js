const { GraphQLClient } = require('graphql-request')
const { SIS_API_URL, SIS_TOKEN, PROXY_TOKEN } = process.env

const BASE_URL = `${API_URL}/graphql`
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

module.exports = {
  request
}
