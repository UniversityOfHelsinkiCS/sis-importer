const { set: redisSet } = require('./utils/redis')
const { serviceIds } = require('./services')
const { scheduleBMQ } = require('./scheduler')
const { SONIC, IS_DEV, UPDATE_RETRY_LIMIT } = require('./config')
const { sleep } = require('./utils')
const { logger } = require('./utils/logger')

const forbiddenServiceIds = []
let isImporting = false

const updateOrdinalFrom = async (total, redisKey, ordinal) => {
  if (total) await redisSet(redisKey, ordinal)
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

  const data = await scheduleBMQ(serviceId)

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
  isImporting = false
}

module.exports = {
  run
}
