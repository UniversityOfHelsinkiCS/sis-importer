const { stan, opts, ORI_PERSON_CHANNEL, ORI_ATTAINMENTS_CHANNEL } = require('./utils/stan')
const personHandler = require('./messageHandlers/person')
const attainmentsHandler = require('./messageHandlers/attainments')

const channels = {
  [ORI_PERSON_CHANNEL]: personHandler,
  [ORI_ATTAINMENTS_CHANNEL]: attainmentsHandler
}

const handleMessage = (CHANNEL, msgHandler) => async msg => {
  const response = await msgHandler(JSON.parse(msg.getData()))
  stan.publish(`${CHANNEL}_STATUS`, JSON.stringify(response), err => {
    if (err) console.log('Failed publishing', err)
  })
  msg.ack()
}

stan.on('connect', () => {
  Object.entries(channels).forEach(([CHANNEL, msgHandler]) => {
    const channel = stan.subscribe(CHANNEL, 'updater-api.workers', opts)
    channel.on('message', handleMessage(CHANNEL, msgHandler))
  })
})
