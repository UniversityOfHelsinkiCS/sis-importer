const Sequelize = require('sequelize')

const { DB_USERNAME, DB_PASSWORD, DB_PORT, DB_HOST, DB_DATABASE, DB_CONNECTION_SSL_MODE, NODE_ENV } = process.env

let DB_CONNECTION_STRING = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?targetServerType=primary`

if (DB_CONNECTION_SSL_MODE) DB_CONNECTION_STRING = `${DB_CONNECTION_STRING}&sslmode=${DB_CONNECTION_SSL_MODE}`

if (NODE_ENV === 'test') DB_CONNECTION_STRING = `postgres://${DB_USERNAME}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`

const sequelize = new Sequelize(DB_CONNECTION_STRING, { logging: false })

const dbHealth = async () => {
  const res = await sequelize.query('SELECT 1 as pass', { raw: true })
  if (!res) return false
  return !!res[0][0]
}

module.exports = {
  sequelize,
  dbHealth
}
