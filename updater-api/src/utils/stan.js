const natsStreaming = require('node-nats-streaming')
const { HOSTNAME, NATS_URI } = process.env

console.log(`Connecting to NATS as ${process.env.HOSTNAME}...`)
const stan = natsStreaming.connect('sis-updater-nats', HOSTNAME, NATS_URI)

const opts = stan.subscriptionOptions()
opts.setManualAckMode(true)
opts.setAckWait(10 * 60 * 1000)
opts.setMaxInFlight(1)

const UPDATER_API_CHANNEL = 'updater-api'

module.exports = {
  stan,
  opts,
  UPDATER_API_CHANNEL
}
