const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')

const { configSentryDSN, nodeEnv } = require('../config')

if (nodeEnv === 'production' && configSentryDSN) {
  Sentry.init({
    dsn: configSentryDSN || 'https://eacaccbb66a62f268b3241ddc4da8519@toska.cs.helsinki.fi/9',
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0
  })
}
