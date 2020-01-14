const moment = require('moment')

const sleep = ms => new Promise(res => setTimeout(() => res(), ms))

const idfy = data =>
  data.reduce((acc, { id, ...p }) => {
    acc[id] = { ...p }
    return acc
  }, {})

const getDate = (date, format = 'DD.MM.YYYY') => {
  if (!date) return null
  return moment(date, format).format('YYYY-MM-DD')
}

const parseDate = (date, format = 'YYYY-MM-DD HH:mm') => date && moment.utc(date, format).toDate()

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

const getColumnsToUpdate = arr => (arr[0] ? Object.keys(arr[0]) : [])

module.exports = {
  idfy,
  getDate,
  parseDate,
  sleep,
  retry,
  getColumnsToUpdate
}
