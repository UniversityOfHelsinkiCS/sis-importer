const Sequelize = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 10000,
    idle: 300000000,
  },
  logging: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? false : true,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
})

const dbHealth = async () => {
  const res = await sequelize.query('SELECT 1 as pass', { raw: true })
  if (!res) return false
  return !!res[0][0]
}

module.exports = {
  sequelize,
  dbHealth,
}
