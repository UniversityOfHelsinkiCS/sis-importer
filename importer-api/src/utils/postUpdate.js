const { stan, opts } = require('./stan')

let postUpdateRunning = false
let channel

const sendToStan = (channel, message) =>
  new Promise((res, rej) => {
    stan.publish(channel, JSON.stringify(message), err => {
      if (err) return rej(err)
      res()
    })
  })

const initializePostUpdateFinishChannel = () => {
  if (channel) return
  channel = stan.subscribe('POST_UPDATE_FINISH', opts)
  channel.on('message', async msg => {
    const data = JSON.parse(msg.getData())

    if (data.success) postUpdateRunning = false

    msg.ack()
  })
}

const postUpdate = () => {
  if (postUpdateRunning) return
  postUpdateRunning = true
  initializePostUpdateFinishChannel()
  sendToStan('POST_UPDATE', { success: true })
}

module.exports = postUpdate
