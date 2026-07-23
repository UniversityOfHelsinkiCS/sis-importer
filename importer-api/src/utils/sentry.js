const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')

const environment = process.env.NODE_ENV || 'production'

// Don't report errors from local development or CI to the importer Sentry project
if (environment !== 'development' && environment !== 'test') {
  Sentry.init({
    dsn: 'https://80bbce2d2c022262ffa355b683198c00@toska.it.helsinki.fi/32',
    // Tells the importer project which environment (and which service) the errors come from
    environment,
    initialScope: {
      tags: { service: 'importer-api' }
    },
    integrations: [nodeProfilingIntegration()],

    // Send structured logs to Sentry
    enableLogs: true,
    // Tracing
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set sampling rate for profiling - this is evaluated only once per SDK.init call
    profileSessionSampleRate: 1.0,
    // Trace lifecycle automatically enables profiling during active traces
    profileLifecycle: 'trace',
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true
  })
}

module.exports = Sentry
