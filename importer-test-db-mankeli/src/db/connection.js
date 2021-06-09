const knex = require('knex')

const { DB_HOST, DB_PORT, DB_USERNAME, SOURCE_DATABASE, TARGET_DATABASE } = process.env

class Connection {
  constructor(db) {
    this.RETRY_ATTEMPTS = 15
    this.db = db
  }

  async connect(attempt = 1) {
    try {
      this.knex = knex({
        client: 'pg',
        connection: {
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USERNAME,
          database: this.db
        },
        pool: {
          min: 0,
          max: 50
        }
      })
      await this.knex.raw('select 1+1 as result')
      console.log(`Connected to ${this.db}`)
    } catch (e) {
      if (attempt > this.RETRY_ATTEMPTS) {
        console.log(`Max retry attemps reached for ${this.db}, returning`)
        return
      }
      console.log(`Database connection to ${this.db} failed! Attempt ${attempt}/${this.RETRY_ATTEMPTS}`)
      console.log("Error: ", e)
      setTimeout(() => this.connectKnex(attempt + 1), 1000 * attempt)
    }
  }
}

const sourceConnection = new Connection(SOURCE_DATABASE)
const targetConnection = new Connection(TARGET_DATABASE)

const connections = [sourceConnection, targetConnection]
connections.forEach(conn => conn.connect())

module.exports = {
  sourceConnection,
  targetConnection
}
