const redis = require('redis')
const redisLock = require('redis-lock')
const { logger } = require('./logger')

const redisRetry = ({ attempt, error }) => {
  if (attempt > 100) {
    throw new Error('Lost connection to Redis...', error)
  }

  return Math.min(attempt * 100, 5000)
}

const client = redis.createClient({
  url: process.env.REDIS_URI,
  reconnectStrategy: redisRetry
})

client.on('connect', () => logger.info('REDIS CONNECTED'))
client.on('ready', () => logger.info('REDIS READY'))
client.on('error', () => logger.error('REDIS ERROR'))
client
  .connect()
  .then(() => {
    logger.info('Client connected to Redis')
  })
  .catch(error => {
    logger.error('Client failed to connect to Redis', error)
  })

const lock = redisLock(client)

const get = async key => await client.get(key)

const set = async (key, val) => await client.set(key, val)

const expire = async (key, val) => await client.expire(key, val)

const del = async key => await client.del(key)

const listener = client.duplicate()
listener.on('error', () => logger.error('REDIS ERROR'))
listener
  .connect()
  .then(() => {
    logger.info('Listener connected to Redis')
  })
  .catch(error => {
    logger.error('Listener failed to connect to Redis', error)
  })

module.exports = {
  lock,
  get,
  set,
  expire,
  del
}
