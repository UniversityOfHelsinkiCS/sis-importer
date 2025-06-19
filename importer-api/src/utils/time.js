module.exports = {
  timed: async promise => {
    const startTime = Date.now()
    const result = await promise
    const endTime = Date.now()
    const duration = endTime - startTime
    return { result, duration }
  }
}
