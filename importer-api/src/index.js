const { stan } = require('./utils/stan')
const { schedule: scheduleCron } = require('./utils/cron')
const { resetOnetimeServices } = require('./scheduler')
const { REJECT_UNAUTHORIZED, IS_DEV, PORT } = require('./config')
const { run } = require('./importer')
const expressApp = require('./explorer')

if (!REJECT_UNAUTHORIZED) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

stan.on('connect', async ({ clientID }) => {
  console.log(`Connected to NATS as ${clientID}...`)
  await resetOnetimeServices()
  run()
  scheduleCron(IS_DEV ? '*/15 * * * * *' : '0 * * * *', run)
})

stan.on('error', e => {
  console.log('STAN ERROR', e)
  process.exit(1)
})

expressApp.listen(PORT, () => {
  console.log(`Importer has explorer running on port ${PORT}`)
})
