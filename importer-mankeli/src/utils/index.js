const sleep = ms => new Promise(res => setTimeout(() => res(), ms))

const retry = async (func, params, attempts = 6) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await func(...params)
      return res
    } catch (e) {
      if (i === attempts) {
        console.log(`Calling function failed`)
        throw e
      }
      console.log(`Retrying ${i}/${attempts - 1}`)
      await sleep(i * 1000)
    }
  }
}

module.exports = {
  sleep,
  retry
}
