const { request } = require('./api')

module.exports = async (query, variables) => {
  return await request(query, variables)
}
