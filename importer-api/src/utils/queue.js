const { Queue, QueueEvents } = require('bullmq')

const { REDIS_HOST, REDIS_PORT, SERVICE_PROVIDER } = require('../config')

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT
}

const defaultJobOptions = {
  removeOnComplete: {
    count: 1000
  },
  removeOnFail: {
    count: 5000
  },
  attempts: 0
}
const fdJobOptions = {
  ...defaultJobOptions,
  removeOnComplete: true,
  removeOnFail: true
}

const queue = new Queue('importer-queue', {
  connection,
  limiter: {
    max: 10000,
    duration: 1000
  },
  defaultJobOptions: SERVICE_PROVIDER !== 'fd' ? defaultJobOptions : fdJobOptions
})

const queueEvents = new QueueEvents('importer-queue', { connection })

module.exports = {
  queue,
  queueEvents
}
