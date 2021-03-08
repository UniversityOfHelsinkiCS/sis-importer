const { set: redisSet, publish: redisPublish } = require('./utils/redis')
const { randomBytes } = require('crypto')
const { serviceIds } = require('./services')
const { schedule } = require('./scheduler')
const { SONIC, IS_DEV, CURRENT_EXECUTION_HASH, UPDATE_RETRY_LIMIT } = require('./config')
const { sleep } = require('./utils')
const { logger } = require('./utils/logger')
const requestBuffer = require('./utils/requestBuffer')

let forbiddenServiceIds = []
let isImporting = false

const updateOrdinalFrom = async (total, redisKey, ordinal) => {
  if (total) await redisSet(redisKey, ordinal)
}

const updateHash = async () => {
  const generatedHash = randomBytes(12).toString('hex')
  await redisSet(CURRENT_EXECUTION_HASH, generatedHash)
  await redisPublish(CURRENT_EXECUTION_HASH, generatedHash)
  return generatedHash
}

const resourceWasForbidden = (err) => {
  const forbiddenResource = ((err || {}).response || {}).status === 403
  if (forbiddenResource) {
    console.log('Added resource to list of forbidden resources')
    logger.error({ message: `Forbidden service: ${serviceId}`, serviceId })
    forbiddenServiceIds.push(serviceId)
    return true
  }
  return false
}

const updateResource = async (serviceId) => {
  if (IS_DEV && !SONIC) await sleep(1000)

  const generatedHash = await updateHash()
  const data = await schedule(serviceId, generatedHash)
  if (!data) return false

  const { greatestOrdinal, hasMore, total, ordinalKey } = data
  console.log(`New ordinal for ${serviceId}: ${greatestOrdinal}`)
  await updateOrdinalFrom(total, ordinalKey, greatestOrdinal)
  logger.info({ message: 'Imported batch' })

  return hasMore
}

const serviceUpdateFun = (serviceId) => {
  const recursivelyUpdateResource = async (attempt = 1) => {
    try {
      const hasMore = await updateResource(serviceId)
      if (!hasMore) return
    
      return recursivelyUpdateResource()
    } catch (err) {
      logger.error({ message: 'Importing failed', meta: err.stack })
  
      if (resourceWasForbidden(err)) return
      if (attempt > UPDATE_RETRY_LIMIT) return
  
      logger.error({ message: `Retrying.. ${attempt} / ${UPDATE_RETRY_LIMIT}` })
      return recursivelyUpdateResource(attempt + 1)
    }
  }
  return recursivelyUpdateResource
}

const update = async () => {
  isImporting = true

  for (const serviceId of serviceIds) {
    requestBuffer.flush()
    if (forbiddenServiceIds.includes(serviceId)) {
      console.log(`Skipping forbidden serviceId ${serviceId}`)
      continue
    }
    
    console.log(`Importing ${serviceId} (${serviceIds.indexOf(serviceId) + 1}/${Object.keys(serviceIds).length})`)

    await serviceUpdateFun(serviceId)()
  }
  isImporting = false
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
