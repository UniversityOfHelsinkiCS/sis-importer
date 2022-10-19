const { set: redisSet, publish: redisPublish } = require('./utils/redis')
const { randomBytes } = require('crypto')
const { serviceIds } = require('./services')
const { schedule } = require('./scheduler')
const { SONIC, IS_DEV, CURRENT_EXECUTION_HASH, UPDATE_RETRY_LIMIT } = require('./config')
const { sleep } = require('./utils')
const postUpdate = require('./utils/postUpdate')
const { logger } = require('./utils/logger')
const requestBuffer = require('./utils/requestBuffer')
const { errorCounter } = require('./prom')

let forbiddenServiceIds = []
let isImporting = false

const updateOrdinalFrom = async (total, redisKey, ordinal) => {
  if (total) await redisSet(redisKey, ordinal)
}

const updateHash = async () => {
  const generatedHash = randomBytes(12).toString('hex')
  console.log(`CURRENT EXECUTION HASH ON REDIS ${generatedHash}`)
  await redisSet(CURRENT_EXECUTION_HASH, generatedHash)
  await redisPublish(CURRENT_EXECUTION_HASH, generatedHash)
  return generatedHash
}

const resourceWasForbidden = (serviceId, err) => {
  const forbiddenResource = ((err || {}).response || {}).status === 403
  if (forbiddenResource) {
    logger.info('Added resource to list of forbidden resources')
    logger.error({ message: `Forbidden service: ${serviceId}`, serviceId })
    forbiddenServiceIds.push(serviceId)
    return true
  }
  return false
}

const updateResource = async serviceId => {
  if (IS_DEV && !SONIC) await sleep(1000)

  const generatedHash = await updateHash()
  const data = await schedule(serviceId, generatedHash)
  if (!data) return false

  const { greatestOrdinal, hasMore, total, ordinalKey } = data
  logger.info(`New ordinal for ${serviceId}: ${greatestOrdinal}`)
  await updateOrdinalFrom(total, ordinalKey, greatestOrdinal)
  logger.info({ message: `Imported batch of ${serviceId}, new ordinal ${greatestOrdinal}`, ordinal: greatestOrdinal })

  return hasMore
}

const serviceUpdateFun = serviceId => {
  const recursivelyUpdateResource = async (attempt = 1) => {
    try {
      const hasMore = await updateResource(serviceId)
      if (!hasMore) return

      return recursivelyUpdateResource()
    } catch (err) {
      logger.error({ message: err.message, meta: err.stack })
      logger.error({ message: 'Importing failed', meta: err.stack })
      errorCounter.inc({ service: serviceId })

      if (resourceWasForbidden(serviceId, err)) return
      if (attempt > UPDATE_RETRY_LIMIT) return

      logger.error({ message: `Retrying.. ${attempt} / ${UPDATE_RETRY_LIMIT}` })
      return recursivelyUpdateResource(attempt + 1)
    }
  }
  return recursivelyUpdateResource
}

const update = async () => {
  for (const serviceId of serviceIds) {
    requestBuffer.flush()
    if (forbiddenServiceIds.includes(serviceId)) {
      logger.info(`Skipping forbidden serviceId ${serviceId}`)
      continue
    }

    logger.info(`Importing ${serviceId} (${serviceIds.indexOf(serviceId) + 1}/${Object.keys(serviceIds).length})`)

    await serviceUpdateFun(serviceId)()
  }
}

const run = async () => {
  if (isImporting) return

  isImporting = true
  await update()
  await postUpdate()
  isImporting = false
}

module.exports = {
  run
}
