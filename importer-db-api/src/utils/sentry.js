const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line

const initializeSentry = app => {
  if (process.env.NODE_ENV !== 'production') return

  Sentry.init({
    dsn: 'https://0510853cc07c4aa98b3fb42add9fede7@sentry.cs.helsinki.fi/7',
    integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
    tracesSampleRate: 1.0,
  })
}

module.exports = initializeSentry
