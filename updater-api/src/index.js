const { stan, opts, UPDATER_API_CHANNEL } = require('./utils/stan')

stan.on('connect', async () => {
  const sub = stan.subscribe(UPDATER_API_CHANNEL, 'updater-api.workers', opts)
  sub.on('message', msg => {
    console.log(JSON.parse(msg.getData()))
    msg.ack()
  })
})
