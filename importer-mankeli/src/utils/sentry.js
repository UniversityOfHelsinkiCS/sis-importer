const Sentry = require('@sentry/node')

const environment = process.env.NODE_ENV || 'production'

// Don't report errors from local development or CI to the importer Sentry project
if (environment !== 'development' && environment !== 'test') {
  Sentry.init({
    dsn: 'https://80bbce2d2c022262ffa355b683198c00@toska.it.helsinki.fi/32',
    // Tells the importer project which environment (and which service) the errors come from
    environment,
    initialScope: {
      tags: { service: 'importer-mankeli' }
    },
    tracesSampleRate: 1.0
  })
}

module.exports = Sentry
