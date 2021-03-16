const { logger } = require('./logger')

const sleep = ms => new Promise(res => setTimeout(() => res(), ms))

const retry = async (func, params, attempts = 6) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await func(...params)
      return res
    } catch (err) {
      if (i === attempts) {
        logger.error({ message: `Calling function failed`, meta: err.stack })
        throw err
      }
      if (err.response.status === 403) {
        // Forbidden. We won't have access by bashing our head against it
        logger.error({ message: `Forbidden endpoint`, meta: err.stack })

        throw err
      }
      logger.info(`Retrying ${i}/${attempts - 1}`)
      await sleep(i * 1000)
    }
  }
}

const request = async (instance, path, attemps = 6) => {
  try {
    const res = await retry(instance.get, [path], attemps)
    return res.data
  } catch (err) {
    logger.error(`Request failed for ${path}`, err)
    throw err
  }
}

module.exports = {
  sleep,
  request,
  retry
}
