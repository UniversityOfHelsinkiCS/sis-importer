const CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'
const FETCH_AMOUNT = process.env.NODE_ENV === 'development' ? 1 : 1000
const DEFAULT_CHUNK_SIZE = 100

module.exports = {
  CURRENT_EXECUTION_HASH,
  FETCH_AMOUNT,
  DEFAULT_CHUNK_SIZE
}
