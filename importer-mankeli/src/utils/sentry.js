const Sentry = require('@sentry/node')

const initializeSentry = () => {
  if (process.env.NODE_ENV !== 'production') return

  Sentry.init({
    dsn: 'https://eacaccbb66a62f268b3241ddc4da8519@toska.cs.helsinki.fi/9'
  })
}

module.exports = initializeSentry
