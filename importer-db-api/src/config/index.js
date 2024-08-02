module.exports.IS_DEV = process.env.NODE_ENV === 'development'
module.exports.serviceProvider = process.env.SERVICE_PROVIDER || 'toska'
module.exports.importerDbApiUser = process.env.IMPORTER_DB_API_USER || ''
module.exports.importerDbApiPassword = process.env.IMPORTER_DB_API_PASSWORD || ''
module.exports.configSentryDSN = process.env.SENTRY_DSN || ''
module.exports.nodeEnv = process.env.NODE_ENV
