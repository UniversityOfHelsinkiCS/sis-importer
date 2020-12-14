const { get: redisGet, set: redisSet, expire: redisExpire } = require('./redis')

const sleep = ms => new Promise(res => setTimeout(() => res(), ms))

const retry = async (func, params, attempts = 6) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await func(...params)
      return res
    } catch (err) {
      if (i === attempts) {
        console.log(`Calling function failed`)
        throw err
      }
      if (err.response.status === 403) {
        // Forbidden. We won't have access by bashing our head against it
        console.log(`Forbidden endpoint`)
        throw err
      }
      console.log(`Retrying ${i}/${attempts - 1}`)
      await sleep(i * 1000)
    }
  }
}

const request = async (instance, path, attemps = 6) => {
  const redisHit = await redisGet(path)
  if (redisHit) return JSON.parse(redisHit)

  try {
    const { data } = await retry(instance.get, [path], attemps)
    await redisSet(path, JSON.stringify(data))
    await redisExpire(path, 3600)
    return data
  } catch (err) {
    console.log(`Request failed for ${path}`)
    throw err
  }
}

module.exports = {
  sleep,
  request,
  retry
}
