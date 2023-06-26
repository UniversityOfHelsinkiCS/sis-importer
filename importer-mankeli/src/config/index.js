module.exports.CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'

module.exports.MIGRATIONS_LOCK = 'MIGRATIONS_LOCK'

const { DB_USERNAME, DB_PASSWORD, DB_PORT, DB_HOST, DB_DATABASE } = process.env

const IS_DEV = process.env.NODE_ENV === 'development'

let DB_CONNECTION_STRING = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?targetServerType=primary`

if (!IS_DEV) DB_CONNECTION_STRING = `${DB_CONNECTION_STRING}&ssl=true`

module.exports.DB_CONNECTION_STRING = DB_CONNECTION_STRING

module.exports.IS_DEV = IS_DEV

module.exports.DB_CONNECTION_RETRY_LIMIT = process.env.NODE_ENV === 'development' ? 6 : 20

module.exports.REJECT_UNAUTHORIZED = process.env.KEY_PATH && process.env.CERT_PATH

module.exports.NATS_GROUP = 'importer-api.workers'
