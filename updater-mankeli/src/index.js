const { stan, opts, ORI_PERSON_CHANNEL } = require('./utils/stan')

stan.on('connect', () => {
  const oriPersonChannel = stan.subscribe(ORI_PERSON_CHANNEL, 'updater-api.workers', opts)
  oriPersonChannel.on('message', msg => {
    msg.ack()
    const { entities, executionHash } = JSON.parse(msg.getData())
    stan.publish(
      `${ORI_PERSON_CHANNEL}_STATUS`,
      JSON.stringify({ status: Math.random() < 0.5 ? 'OK' : 'FAIL', entities, executionHash }),
      err => {
        if (err) console.log('Failed publishing', err)
      }
    )
  })
})
