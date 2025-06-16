const { Queue, QueueEvents } = require('bullmq')

const { REDIS_HOST, REDIS_PORT } = require('../config')

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT
}

const queue = new Queue('importer-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: {
      count: 1000
    },
    removeOnFail: {
      count: 5000
    }
  }
})

const queueEvents = new QueueEvents('importer-queue', { connection })

module.exports = {
  queue,
  queueEvents
}
