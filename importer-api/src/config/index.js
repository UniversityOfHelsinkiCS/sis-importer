const CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'
const FETCH_AMOUNT = process.env.NODE_ENV === 'development' ? 15 : 1000
const DEFAULT_CHUNK_SIZE = process.env.NODE_ENV === 'development' ? 100 : 100
const APIS = {
  ori: 'ORI',
  kori: 'KORI'
}
const UPDATE_RETRY_LIMIT = 6
const PANIC_TIMEOUT = process.env.NODE_ENV === 'development' ? 60 * 1000 : 60 * 1000 * 15

module.exports = {
  CURRENT_EXECUTION_HASH,
  FETCH_AMOUNT,
  DEFAULT_CHUNK_SIZE,
  APIS,
  UPDATE_RETRY_LIMIT,
  PANIC_TIMEOUT
}
