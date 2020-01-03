const CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'
const FETCH_AMOUNT = process.env.NODE_ENV === 'development' ? 15 : 1000
const DEFAULT_CHUNK_SIZE = process.env.NODE_ENV === 'development' ? 5 : 100
const APIS = {
  ori: 'ORI',
  kori: 'KORI'
}

module.exports = {
  CURRENT_EXECUTION_HASH,
  FETCH_AMOUNT,
  DEFAULT_CHUNK_SIZE,
  APIS
}
