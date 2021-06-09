const knex = require('knex')
const Sequelize = require('sequelize')


const { DB_HOST, DB_PORT, DB_USERNAME, SOURCE_DATABASE, TARGET_DATABASE } = process.env

DB_CONFIG = {
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 10000,
    idle: 300000000
  },
  username: DB_USERNAME,
  port: DB_PORT,
  host: DB_HOST,
  database: TARGET_DATABASE,
  logging: false
}

class Connection {
  constructor() {
    this.RETRY_ATTEMPTS = 15
  }

  async connectKnex(attempt = 1) {
    try {
      this.knex = knex({
        client: 'pg',
        connection: {
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USERNAME,
          database: SOURCE_DATABASE
        },
        pool: {
          min: 0,
          max: 50
        }
      })
      await this.knex.raw('select 1+1 as result')
      console.log("Connected to source db with knex")
    } catch (e) {
      if (attempt > this.RETRY_ATTEMPTS) {
        console.log("Attempted too many times with knex, returning")
        return
      }
      console.log(`Knex database connection failed! Attempt ${attempt}/${this.RETRY_ATTEMPTS}`)
      console.log("Error: ", e)
      setTimeout(() => this.connectKnex(attempt + 1), 1000 * attempt)
    }
  }
  async connectSequelize(attempt = 1) {
    try {
      this.sequelize = new Sequelize({
        ...DB_CONFIG
      })
      await this.sequelize.authenticate()
      console.log("Connected to target db with sequelize")
    } catch (e) {
      if (attempt > this.RETRY_ATTEMPTS) {
        console.log("Attempted too many times with sequelize, returning")
        return
      }
      console.log(`Sequelize database connection failed! Attempt ${attempt}/${this.RETRY_ATTEMPTS}`)
      console.log("Error: ", e)
      setTimeout(() => this.connectSequelize(attempt + 1), 1000 * attempt)
    }
  }
}

const connection = new Connection()
connection.connectKnex(),
connection.connectSequelize()

module.exports = {
  connection,
}
