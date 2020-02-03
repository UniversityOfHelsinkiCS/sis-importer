const REJECT_UNAUTHORIZED = process.env.REJECT_UNAUTHORIZED === '0' ? false : true
const SONIC = process.env.SONIC === '1'
const CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'
const IS_DEV = process.env.NODE_ENV === 'development'
const FETCH_AMOUNT = IS_DEV && !SONIC ? 15 : 1000
const DEFAULT_CHUNK_SIZE = IS_DEV && !SONIC ? 5 : 50
const APIS = {
  ori: 'ORI',
  kori: 'KORI',
  urn: 'URN'
}
const UPDATE_RETRY_LIMIT = 6
const PANIC_TIMEOUT = IS_DEV || SONIC ? 60 * 1000 : 60 * 1000 * 5

module.exports = {
  REJECT_UNAUTHORIZED,
  SONIC,
  CURRENT_EXECUTION_HASH,
  FETCH_AMOUNT,
  DEFAULT_CHUNK_SIZE,
  IS_DEV,
  APIS,
  UPDATE_RETRY_LIMIT,
  PANIC_TIMEOUT
}
