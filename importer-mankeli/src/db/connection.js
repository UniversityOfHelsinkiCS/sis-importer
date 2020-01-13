const Sequelize = require('sequelize')
const Umzug = require('umzug')
const { DB_CONFIG, DB_CONNECTION_RETRY_LIMIT, MIGRATIONS_LOCK } = require('../config')
const { lock } = require('../utils/redis')

const sequelize = new Sequelize({
  ...DB_CONFIG
})

class Connection {
  constructor() {
    this.error = false
    this.established = false
  }

  async connectToDatabase(attempt = 1) {
    this.error = false
    try {
      await sequelize.authenticate()
      console.log('Connected to database successfully!')
      await this.runMigrations()
      this.established = true
    } catch (e) {
      if (attempt === DB_CONNECTION_RETRY_LIMIT) {
        console.log(`Connection to database failed after ${attempt} attempts`)
        console.error(e)
        this.error = true
        return
      }
      console.log(`Connection to database failed! Attempt ${attempt} of ${DB_CONNECTION_RETRY_LIMIT}`)
      setTimeout(() => this.connectToDatabase(attempt + 1), 1000 * attempt)
    }
  }

  async runMigrations() {
    lock(MIGRATIONS_LOCK, async done => {
      try {
        const migrator = new Umzug({
          storage: 'sequelize',
          storageOptions: {
            sequelize,
            tableName: 'migrations'
          },
          logging: console.log,
          migrations: {
            params: [sequelize.getQueryInterface(), Sequelize],
            path: `${process.cwd()}/src/db/migrations`,
            pattern: /\.js$/
          }
        })
        const migrations = await migrator.up()
        console.log('Migrations up to date', migrations)
      } catch (e) {
        this.error = true
        console.log('Migration error', e)
      }
      done()
    })
  }
}

const connection = new Connection()
connection.connectToDatabase()

module.exports = { sequelize, connection }
