const redis = require('redis')
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
    logger.info('Connected to Redis')
  })
  .catch(error => {
    logger.error('Failed to connect to Redis', error)
  })

const sadd = async (key, val) => await client.sAdd(key, val)

const smembers = async key => await client.sMembers(key)

const get = async key => await client.get(key)

const set = async (key, val) => await client.set(key, val)

const expire = async (key, val) => await client.expire(key, val)

const del = async key => await client.del(key)

const incrby = async (key, val) => await client.incrBy(key, val)

const publish = async (channel, message) => await client.publish(channel, message)

module.exports = {
  sadd,
  smembers,
  get,
  set,
  expire,
  del,
  incrby,
  publish
}
