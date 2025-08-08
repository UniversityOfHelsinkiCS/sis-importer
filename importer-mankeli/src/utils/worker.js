const { Worker } = require('bullmq')
const { logger } = require('./logger')

const { REDIS_HOST, REDIS_PORT } = require('../config')

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT
}

const createWorker = jobHandler => {
  const worker = new Worker('importer-queue', jobHandler, { connection, autorun: false })

  worker.on('completed', job => {
    logger.info({
      message: `Job ${job.id} completed`,
      type: job.name,
      count: job.data?.length,
      timems: job.finishedOn - job.processedOn
    })
  })

  worker.on('error', error => {
    logger.error(`Job returned error: ${error.toString()}`)
  })

  worker.on('failed', (job, error) => {
    logger.error(`Job ${job.id} failed. ${error.stack ?? ''}`)
  })

  worker.on('active', job => {
    logger.info(`Started job ${job.id}`)
  })

  return worker
}

module.exports = createWorker
