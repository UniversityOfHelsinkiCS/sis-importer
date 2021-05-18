const knex = require('knex')
const EventEmitter = require('events')

const { DB_USERNAME, DB_PORT, DB_HOST, DB_DATABASE } = process.env

class KnexConnection extends EventEmitter {
  constructor() {
    super()
    this.RETRY_ATTEMPTS = 15
  }

  async connect(attempt = 1) {
    try {
      this.knex = knex({
        client: 'pg',
        version: '9.6.3',
        connection: {
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USERNAME,
          database: DB_DATABASE
        },
        pool: {
          min: 0,
          max: 5
        }
      })
      await this.knex.raw('select 1+1 as result')
      this.emit('connect')
    } catch (e) {
      if (attempt > this.RETRY_ATTEMPTS) {
        this.emit('error', e)
        return
      }
      console.log(`Knex database connection failed! Attempt ${attempt}/${this.RETRY_ATTEMPTS}`)
      console.log("Error: ", e)
      setTimeout(() => this.connect(attempt + 1), 1000 * attempt)
    }
  }
}

const knexConnection = new KnexConnection()
module.exports = {
  knexConnection
}
