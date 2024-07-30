const Sentry = require('@sentry/node')

const initializeSentry = () => {
  if (process.env.NODE_ENV !== 'production' || (process.env.SERVICE_PROVIDER === 'fd' && !process.env.SENTRY_DSN))
    return

  const sentryDSN = process.env.SENTRY_DSN || 'https://eacaccbb66a62f268b3241ddc4da8519@toska.cs.helsinki.fi/9'

  Sentry.init({
    dsn: sentryDSN
  })
}

module.exports = initializeSentry
