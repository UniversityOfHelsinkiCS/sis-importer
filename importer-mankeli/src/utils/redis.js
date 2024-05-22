const redis = require('redis')
const redisLock = require('redis-lock')
const { promisify } = require('util')
const { CURRENT_EXECUTION_HASH } = require('../config')
const { logger } = require('./logger')

const redisRetry = ({ attempt, error }) => {
  if (attempt > 100) {
    throw new Error('Lost connection to Redis...', error)
  }

  return Math.min(attempt * 100, 5000)
}

const listener = redis.createClient({
  url: process.env.REDIS_URI,
  retry_strategy: redisRetry
})

const client = redis.createClient({
  url: process.env.REDIS_URI,
  retry_strategy: redisRetry
})

client.on('connect', () => logger.info('REDIS CONNECTED'))
client.on('ready', () => logger.info('REDIS READY'))
client.on('error', () => logger.error('REDIS ERROR'))

const lock = promisify(redisLock(client))

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

listener.subscribe(CURRENT_EXECUTION_HASH)
const onCurrentExecutionHashChange = async handleChange => {
  const initialExecutionHash = await get(CURRENT_EXECUTION_HASH)
  if (initialExecutionHash) handleChange(initialExecutionHash)
  listener.on('message', async (_, hash) => {
    handleChange(hash)
  })
}

module.exports = {
  onCurrentExecutionHashChange,
  lock,
  get,
  set,
  expire
}
