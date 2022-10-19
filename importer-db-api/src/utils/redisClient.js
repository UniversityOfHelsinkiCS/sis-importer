const redis = require('redis')

const redisRetry = ({ attempt, error }) => {
  if (attempt > 10) {
    console.error('Lost connection to Redis...', error)
    return
  }

  return Math.min(attempt * 100, 5000)
}

// eslint-disable-next-line no-unused-vars
const connectRedis = () => {
  try {
    const client = redis.createClient({
      url: process.env.REDIS_URI,
      retry_strategy: redisRetry,
    })
    if (!client) throw new Error('redis broken or not available?')

    client.on('connect', () => console.log('REDIS CONNECTED'))
    client.on('ready', () => console.log('REDIS READY'))
    client.on('error', () => console.log('REDIS ERROR'))

    return client
  } catch (e) {
    console.error('Error while connecting to redis: ', e)
    console.log('REDIS NOT AVAILABLE')
    return null
  }
}

const client = null // connectRedis()

const redisPromisify = async (func, ...params) =>
  new Promise((res, rej) => {
    func.call(client, ...params, (err, data) => {
      if (err) rej(err)
      else res(data)
    })
  })

const redisClient = client
  ? {
      get: async key => await redisPromisify(client.get, key),
      set: async (key, val) => await redisPromisify(client.set, key, val),
    }
  : { get: () => null, set: () => null }

module.exports = {
  redisClient,
}
