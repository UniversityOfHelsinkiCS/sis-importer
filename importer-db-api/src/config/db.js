const Sequelize = require('sequelize')

const { IS_DEV } = require('../config')

const { DB_USERNAME, DB_PASSWORD, DB_PORT, DB_HOST, DB_DATABASE } = process.env

let DB_CONNECTION_STRING = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?targetServerType=primary`

if (!IS_DEV) DB_CONNECTION_STRING = `${DB_CONNECTION_STRING}&ssl=true`

const sequelize = new Sequelize(DB_CONNECTION_STRING, { logging: false })

const dbHealth = async () => {
  const res = await sequelize.query('SELECT 1 as pass', { raw: true })
  if (!res) return false
  return !!res[0][0]
}

module.exports = {
  sequelize,
  dbHealth,
}
