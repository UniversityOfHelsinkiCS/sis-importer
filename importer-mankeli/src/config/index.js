module.exports.MIGRATIONS_LOCK = 'MIGRATIONS_LOCK'

const { DB_USERNAME, DB_PASSWORD, DB_PORT, DB_HOST, DB_DATABASE, DB_CONNECTION_SSL_MODE, REDIS_HOST, REDIS_PORT } =
  process.env

const IS_DEV = process.env.NODE_ENV === 'development'

const SERVICE_PROVIDER = process.env.SERVICE_PROVIDER || ''

let DB_CONNECTION_STRING = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?targetServerType=primary`

if (DB_CONNECTION_SSL_MODE) DB_CONNECTION_STRING = `${DB_CONNECTION_STRING}&sslmode=${DB_CONNECTION_SSL_MODE}`

module.exports.DB_CONNECTION_STRING = DB_CONNECTION_STRING

module.exports.IS_DEV = IS_DEV

module.exports.DB_CONNECTION_RETRY_LIMIT = process.env.NODE_ENV === 'development' ? 6 : 20

module.exports.REJECT_UNAUTHORIZED = process.env.KEY_PATH && process.env.CERT_PATH

module.exports.REDIS_HOST = REDIS_HOST

module.exports.REDIS_PORT = REDIS_PORT

module.exports.SERVICE_PROVIDER = SERVICE_PROVIDER
