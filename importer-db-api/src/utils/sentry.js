const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const { serviceProvider, configSentryDSN, nodeEnv } = require('../config')

const initializeSentry = app => {
  const noSentryDsnInFdEnvironment = serviceProvider === 'fd' && !configSentryDSN

  if (nodeEnv !== 'production' || noSentryDsnInFdEnvironment) return

  const sentryDSN = configSentryDSN || 'https://eacaccbb66a62f268b3241ddc4da8519@toska.cs.helsinki.fi/9'

  Sentry.init({
    dsn: sentryDSN,
    integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
    tracesSampleRate: 1.0
  })
}

module.exports = initializeSentry
