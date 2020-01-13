module.exports.CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'

module.exports.MIGRATIONS_LOCK = 'MIGRATIONS_LOCK'

const { DB_USERNAME, DB_PASSWORD, DB_PORT, DB_HOST, DB_DATABASE } = process.env

module.exports.DB_CONFIG = {
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 10000,
    idle: 300000000
  },
  username: DB_USERNAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  host: DB_HOST,
  database: DB_DATABASE
}

module.exports.DB_CONNECTION_RETRY_LIMIT = process.env.NODE_ENV === 'development' ? 6 : 20
