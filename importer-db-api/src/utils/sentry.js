const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line

const initializeSentry = app => {
  if (process.env.NODE_ENV !== 'production' || (process.env.SERVICE_PROVIDER === 'fd' && !process.env.SENTRY_DSN)) return

  const sentryDSN = process.env.SENTRY_DSN || 'https://eacaccbb66a62f268b3241ddc4da8519@toska.cs.helsinki.fi/9'

  Sentry.init({
    dsn: sentryDSN,
    integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
    tracesSampleRate: 1.0
  })
}

module.exports = initializeSentry
