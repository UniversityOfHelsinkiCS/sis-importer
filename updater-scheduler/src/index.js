const { schedule } = require('./utils/cron')
const { stan, UPDATER_API_CHANNEL } = require('./utils/stan')

stan.on('connect', () => {
  start()
})

const start = () => {
  console.log('Creating cron jobs...')
  schedule('* * * * * *', () => {
    stan.publish(UPDATER_API_CHANNEL, JSON.stringify({ task: 'hello!' }), err => {
      if (err) console.log('publish failed!', err)
    })
  })
}
