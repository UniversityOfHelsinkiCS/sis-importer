const redis = require('redis')
const logger = require('./logger')

const redisRetry = ({ attempt, error }) => {
  if (attempt > 10) {
    logger.error('Lost connection to Redis...', error)
    return
  }

  return Math.min(attempt * 100, 5000)
}

// eslint-disable-next-line no-unused-vars
const connectRedis = () => {
  try {
    const client = redis.createClient({
      url: process.env.REDIS_URI,
      retry_strategy: redisRetry
    })
    if (!client) throw new Error('redis broken or not available?')

    client.on('connect', () => logger.info('REDIS CONNECTED'))
    client.on('ready', () => logger.info('REDIS READY'))
    client.on('error', () => logger.error('REDIS ERROR'))

    return client
  } catch (e) {
    logger.error('Error while connecting to redis: ', e)
    logger.info('REDIS NOT AVAILABLE')
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
      set: async (key, val) => await redisPromisify(client.set, key, val)
    }
  : { get: () => null, set: () => null }

module.exports = {
  redisClient
}
