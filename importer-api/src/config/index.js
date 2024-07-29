const PORT = process.env.PORT || 3002
const REJECT_UNAUTHORIZED = process.env.KEY_PATH && process.env.CERT_PATH
const SONIC = process.env.SONIC === '1'
const CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'
const IS_DEV = process.env.NODE_ENV === 'development'
const FETCH_AMOUNT = IS_DEV && !SONIC ? 15 : 1000
const MAX_CHUNK_SIZE = IS_DEV && !SONIC ? 5 : 100
const APIS = {
  ori: 'ORI',
  kori: 'KORI',
  ilmo: 'ILMO',
  osuva: 'OSUVA',
  urn: 'URN',
  custom: 'CUSTOM',
  graphql: 'GRAPHQL'
}
const UPDATE_RETRY_LIMIT = 6
const PANIC_TIMEOUT = IS_DEV || SONIC ? 60 * 1000 : 15 * 1000 // * 5
const SERVICE_PROVIDER = process.env.SERVICE_PROVIDER || ''

module.exports = {
  PORT,
  REJECT_UNAUTHORIZED,
  SONIC,
  CURRENT_EXECUTION_HASH,
  FETCH_AMOUNT,
  MAX_CHUNK_SIZE,
  IS_DEV,
  APIS,
  UPDATE_RETRY_LIMIT,
  PANIC_TIMEOUT,
  SERVICE_PROVIDER
}
