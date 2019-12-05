const { stan, opts, ORI_PERSON_CHANNEL, ORI_ATTAINMENTS_CHANNEL } = require('./utils/stan')

const handleMessage = CHANNEL => async msg => {
  const { entities, executionHash } = JSON.parse(msg.getData())
  stan.publish(
    `${CHANNEL}_STATUS`,
    JSON.stringify({ status: Math.random() < 0.95 ? 'OK' : 'FAIL', entities, executionHash }),
    err => {
      if (err) console.log('Failed publishing', err)
    }
  )
  msg.ack()
}

const channels = {
  [ORI_PERSON_CHANNEL]: handleMessage,
  [ORI_ATTAINMENTS_CHANNEL]: handleMessage
}

stan.on('connect', () => {
  Object.entries(channels).forEach(([CHANNEL, msgHandler]) => {
    const channel = stan.subscribe(CHANNEL, 'updater-api.workers', opts)
    channel.on('message', msgHandler(CHANNEL))
  })
})
