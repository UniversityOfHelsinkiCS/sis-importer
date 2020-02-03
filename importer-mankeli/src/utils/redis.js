const redis = require('redis')
const redisLock = require('redis-lock')
const { promisify } = require('util')
const { CURRENT_EXECUTION_HASH } = require('../config')

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

const lock = promisify(redisLock(client))

listener.subscribe(CURRENT_EXECUTION_HASH)
const onCurrentExecutionHashChange = async handleChange => {
  listener.on('message', async (_, hash) => {
    handleChange(hash)
  })
}

module.exports = {
  onCurrentExecutionHashChange,
  lock
}
