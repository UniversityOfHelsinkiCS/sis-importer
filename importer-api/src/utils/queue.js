const { Queue, QueueEvents } = require('bullmq')

const {
  REDIS_HOST,
  REDIS_PORT,
  SERVICE_PROVIDER,
  QUEUE_COMPLETE_COUNT,
  QUEUE_COMPLETE_AGE,
  QUEUE_FAIL_COUNT,
  QUEUE_FAIL_AGE
} = require('../config')

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
  removeOnComplete: {
    age: QUEUE_COMPLETE_AGE,
    count: QUEUE_COMPLETE_COUNT
  },
  removeOnFail: {
    age: QUEUE_FAIL_AGE,
    count: QUEUE_FAIL_COUNT
  }
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
