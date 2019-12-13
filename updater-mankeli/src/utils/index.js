const moment = require('moment')

const idfy = data =>
  data.reduce((acc, { id, ...p }) => {
    acc[id] = { ...p }
    return acc
  }, {})

const getDate = (date, format = 'DD.MM.YYYY') => {
  if (!date) return null
  return moment(date, format).format('YYYY-MM-DD')
}

module.exports = {
  idfy,
  getDate
}
