const { stan, opts, ORI_PERSON_CHANNEL, ORI_ATTAINMENTS_CHANNEL } = require('./utils/stan')
const personHandler = require('./messageHandlers/person')
const attainmentsHandler = require('./messageHandlers/attainments')

if (process.env.NODE_ENV === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const channels = {
  [ORI_PERSON_CHANNEL]: personHandler,
  [ORI_ATTAINMENTS_CHANNEL]: attainmentsHandler
}

const handleMessage = (CHANNEL, msgHandler) => async msg => {
  msg.ack()
  let response = null
  try {
    const data = JSON.parse(msg.getData())
    response = { ...(await msgHandler(data)), status: 'OK', amount: data.entities.length }
  } catch (e) {
    response = { ...JSON.parse(msg.getData()), status: 'FAIL', amount: 0 }
  }
  stan.publish(`${CHANNEL}_STATUS`, JSON.stringify(response), err => {
    if (err) console.log('Failed publishing', err)
  })
}

stan.on('connect', () => {
  Object.entries(channels).forEach(([CHANNEL, msgHandler]) => {
    const channel = stan.subscribe(CHANNEL, 'updater-api.workers', opts)
    channel.on('message', handleMessage(CHANNEL, msgHandler))
  })
})
