const { stan } = require('./utils/stan')
const { schedule: scheduleCron } = require('./utils/cron')
const { resetOnetimeServices } = require('./scheduler')
const { REJECT_UNAUTHORIZED, IS_DEV, PORT } = require('./config')
const { logger } = require('./utils/logger')
const { run } = require('./importer')
const expressApp = require('./explorer')

if (!REJECT_UNAUTHORIZED) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

stan.on('connect', async ({ clientID }) => {
  logger.info(`Connected to NATS as ${clientID}...`)
  await resetOnetimeServices()
  run()
  scheduleCron(IS_DEV ? '*/15 * * * * *' : '0 * * * *', run)
})

stan.on('error', e => {
  logger.error({ message: 'STAN ERROR', meta: e.stack })
  process.exit(1)
})

expressApp.listen(PORT, () => {
  logger.info(`Importer has explorer running on port ${PORT}`)
})
