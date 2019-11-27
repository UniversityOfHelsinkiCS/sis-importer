const { GraphQLClient } = require('graphql-request')
const { SIS_API_URL, SIS_TOKEN } = process.env

const api = new GraphQLClient(SIS_API_URL, {
  headers: {
    Authorization: `Bearer ${SIS_TOKEN}`
  }
})

const request = async (query, variables) => {
  const data = await api.request(query, variables)
  return data
}

module.exports = {
  request
}
