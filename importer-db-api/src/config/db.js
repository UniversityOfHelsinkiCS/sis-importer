const Sequelize = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 10000,
    idle: 300000000
  },
  logging: process.env.NODE_ENV === 'production' ? false : true,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
})

module.exports = {
  sequelize
}