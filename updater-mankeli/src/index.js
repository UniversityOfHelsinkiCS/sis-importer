const { stan, opts, ORI_PERSON_CHANNEL } = require('./utils/stan')

stan.on('connect', () => {
  const oriPersonChannel = stan.subscribe(ORI_PERSON_CHANNEL, 'updater-api.workers', opts)
  oriPersonChannel.on('message', msg => {
    console.log(msg.getData())
    msg.ack()
  })
})
