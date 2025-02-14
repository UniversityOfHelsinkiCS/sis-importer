const Sentry = require('@sentry/node')

if (process.env.NODE_ENV === 'production' && (process.env.SERVICE_PROVIDER !== 'fd' || process.env.SENTRY_DSN)) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://9b31b43c3f270430d3bb4d7ec9ad8094@toska.cs.helsinki.fi/24',
    tracesSampleRate: 1.0
  })
}
