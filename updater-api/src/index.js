const { stan, opts, UPDATER_API_CHANNEL } = require('./utils/stan')
const { sadd, smembers } = require('./utils/redis')
const educationSearchQuery = require('./queries/educationSearch')

const testQuery = async () => {
  const response = await educationSearchQuery({ fullTextQuery: 'Tietojenkäsittelytietee' })
  console.log('response', response)
}

const init = async () => {
  await sadd('time', `Initialized at ${new Date()}`)
  const times = await smembers('time')
  console.log(times)
  await testQuery()
}

stan.on('connect', async () => {
  init()
  const sub = stan.subscribe(UPDATER_API_CHANNEL, 'updater-api.workers', opts)
  sub.on('message', msg => {
    console.log(JSON.parse(msg.getData()))
    msg.ack()
  })
})
