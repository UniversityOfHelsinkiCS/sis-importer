const redis = require('redis')
const { CURRENT_EXECUTION_HASH } = require('../config')

const listener = redis.createClient({
  url: '//redis:6379'
})

listener.config('set', 'notify-keyspace-events', 'KEA')
listener.subscribe('__keyevent@0__:set', CURRENT_EXECUTION_HASH)

const client = redis.createClient({
  url: '//redis:6379'
})

const redisPromisify = async (func, ...params) =>
  new Promise((res, rej) => {
    func.call(client, ...params, (err, data) => {
      if (err) rej(err)
      else res(data)
    })
  })

const get = async key => await redisPromisify(client.get, key)

const set = async (key, val) => await redisPromisify(client.set, key, val)

const expire = async (key, val) => await redisPromisify(client.expire, key, val)

const onCurrentExecutionHashChange = async handleChange => {
  const initialValue = await get(CURRENT_EXECUTION_HASH)
  handleChange(initialValue)

  listener.on('message', async (_, key) => {
    if (key === CURRENT_EXECUTION_HASH) {
      const val = await get(key)
      handleChange(val)
    }
  })
}

module.exports = {
  onCurrentExecutionHashChange,
  get,
  set,
  expire
}
