const { stan } = require('./stan')

const sendToStan = (channel, message) => new Promise((res, rej) => {
  stan.publish(channel, JSON.stringify(message), err => {
    if (err) return rej(err)
    res()
  })
})

const postUpdate = () => {
  sendToStan('POST_UPDATE', { success: true })
  console.log('Test')
}

module.exports = postUpdate