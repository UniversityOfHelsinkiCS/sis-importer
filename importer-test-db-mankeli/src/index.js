const { knexConnection } = require('./db/connection')

knexConnection.on('error', e => {
  console.log('Knex database connection failed', e)
  process.exit(1)
})

knexConnection.on('connect', async () => {
  console.log('Knex database connection established successfully')
})

const run = async () => {
  await knexConnection.connect()
}

run()
