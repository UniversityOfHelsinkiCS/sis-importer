const knex = require('knex')

const { DB_HOST, DB_PORT, DB_USERNAME, DB_NAME } = process.env

class Connection {
  constructor() {
    this.RETRY_ATTEMPTS = 15
  }

  async connect(attempt = 1) {
    try {
      this.knex = knex({
        client: 'pg',
        connection: {
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USERNAME,
          database: DB_NAME
        },
        pool: {
          min: 0,
          max: 50
        }
      })
      await this.knex.raw('select 1+1 as result')
      console.log(`Connected to ${DB_NAME}`)
    } catch (e) {
      if (attempt > this.RETRY_ATTEMPTS) {
        console.log(`Max retry attemps reached for ${DB_NAME}, returning`)
        return
      }
      console.log(`Database connection to ${DB_NAME} failed! Attempt ${attempt}/${this.RETRY_ATTEMPTS}`)
      console.log('Error: ', e)
      setTimeout(() => this.connectKnex(attempt + 1), 1000 * attempt)
    }
  }
}

const connection = new Connection()
connection.connect()

module.exports = {
  connection
}
