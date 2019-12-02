const { request } = require('./graphQLApi')

module.exports = async (query, variables) => {
  return await request(query, variables)
}
