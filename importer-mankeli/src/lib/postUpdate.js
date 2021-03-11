const { stan, opts } = require('../utils/stan')
const { NATS_GROUP, IS_DEV } = require('../config')

const sendToStan = (channel, message) =>
  new Promise((res, rej) => {
    stan.publish(channel, JSON.stringify(message), err => {
      if (err) return rej(err)
      res()
    })
  })


const postUpdate = async () => {
  if (IS_DEV) return console.log('Skipping post update in dev env')
  console.log('Post Update Start')

  sendToStan('POST_UPDATE_FINISH', { success: true })
}

const initializePostUpdateChannel = () => {
  const channel = stan.subscribe('POST_UPDATE', NATS_GROUP, opts)
  channel.on('message', async msg => {
    const data = JSON.parse(msg.getData())

    if (data.success) await postUpdate()

    msg.ack()
  })
}

module.exports = initializePostUpdateChannel
