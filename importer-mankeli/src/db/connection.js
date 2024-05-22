const Sequelize = require('sequelize')
const Umzug = require('umzug')
const { DB_CONNECTION_STRING, DB_CONNECTION_RETRY_LIMIT, MIGRATIONS_LOCK } = require('../config')
const { lock } = require('../utils/redis')
const { logger } = require('../utils/logger')

class Connection {
  constructor() {
    this.error = false
    this.established = false
  }

  async connectToDatabase(attempt = 1) {
    this.error = false
    this.established = false
    try {
      this.sequelize = new Sequelize(DB_CONNECTION_STRING, { logging: false })
      await this.sequelize.authenticate()
      logger.info('Connected to database successfully!')
      await this.runMigrations()
      this.established = true
    } catch (e) {
      if (attempt === DB_CONNECTION_RETRY_LIMIT) {
        logger.error(`Connection to database failed after ${attempt} attempts`)
        logger.error(e)
        this.error = true
        return
      }
      logger.error(`Connection to database failed! Attempt ${attempt} of ${DB_CONNECTION_RETRY_LIMIT}`)
      setTimeout(() => this.connectToDatabase(attempt + 1), 1000 * attempt)
    }
  }

  async runMigrations() {
    const unlock = await lock(MIGRATIONS_LOCK, 1000 * 60 * 10)
    try {
      const migrator = new Umzug({
        storage: 'sequelize',
        storageOptions: {
          sequelize: this.sequelize,
          tableName: 'migrations'
        },
        logging: logger.info,
        migrations: {
          params: [this.sequelize.getQueryInterface(), Sequelize],
          path: `${process.cwd()}/src/db/migrations`,
          pattern: /\.js$/
        }
      })
      const migrations = await migrator.up()
      logger.info('Migrations up to date', migrations)
    } catch (e) {
      this.error = true
      logger.error('Migration error', e)
    }
    unlock()
  }
}

const connection = new Connection()
connection.connectToDatabase()

module.exports = { connection }
