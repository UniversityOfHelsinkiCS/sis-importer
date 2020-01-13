const sleep = ms => new Promise(res => setTimeout(() => res(), ms))

const request = async (instance, path, retry = 6) => {
  for (let i = 1; i <= retry; i++) {
    try {
      const res = await instance.get(path)
      return res.data
    } catch (e) {
      if (i === retry) {
        console.log(`Request failed for ${path}`)
        throw e
      }
      console.log(`Retrying ${i}/${retry - 1} for ${path}`)
      await sleep(i * 1000)
    }
  }
}

module.exports = {
  sleep,
  request
}
