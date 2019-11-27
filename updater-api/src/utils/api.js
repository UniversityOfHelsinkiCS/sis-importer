const { GraphQLClient } = require('graphql-request')
const { SIS_API_URL, SIS_TOKEN } = process.env

const api = new GraphQLClient(SIS_API_URL, {
  headers: {
    Authorization: `Application ${SIS_TOKEN}`
  }
})

const request = async (query, variables) => {
  if (SIS_API_URL) {
    const data = await api.request(query, variables)
    return data
  }
}

module.exports = {
  request
}
