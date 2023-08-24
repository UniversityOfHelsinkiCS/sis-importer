const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line

const initializeSentry = app => {
  if (process.env.NODE_ENV !== 'production') return

  Sentry.init({
    dsn: 'https://eacaccbb66a62f268b3241ddc4da8519@toska.cs.helsinki.fi/9',
    integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
    tracesSampleRate: 1.0,
  })
}

module.exports = initializeSentry
