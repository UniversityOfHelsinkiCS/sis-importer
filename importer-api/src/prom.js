const prom = require('prom-client')

const successCounter = new prom.Counter({
  name: 'imported',
  help: 'how much stuff is imported',
  labelNames: ['service']
})

const errorCounter = new prom.Counter({
  name: 'errors',
  help: 'how much errors when importing',
  labelNames: ['service']
})

module.exports = { prom, successCounter, errorCounter }
