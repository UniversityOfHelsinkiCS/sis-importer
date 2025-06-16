const PORT = process.env.PORT || 3002
const REDIS_PORT = process.env.REDIS_PORT || 6379
const REDIS_HOST = process.env.REDIS_HOST || 'importet-redis'
const REJECT_UNAUTHORIZED = process.env.KEY_PATH && process.env.CERT_PATH
const SONIC = process.env.SONIC === '1'
const CURRENT_EXECUTION_HASH = 'CURRENT_EXECUTION_HASH'
const IS_DEV = process.env.NODE_ENV === 'development'
const FETCH_AMOUNT = IS_DEV && !SONIC ? 15 : 1000
const MAX_CHUNK_SIZE = IS_DEV && !SONIC ? 5 : 100
const APIS = {
  ori: 'ORI',
  kori: 'KORI',
  koriPublic: 'KORI_PUBLIC',
  ilmo: 'ILMO',
  osuva: 'OSUVA',
  urn: 'URN',
  custom: 'CUSTOM',
  graphql: 'GRAPHQL'
}
const UPDATE_RETRY_LIMIT = 6
const PANIC_TIMEOUT = IS_DEV || SONIC ? 60 * 1000 : 15 * 1000 // * 5
const SERVICE_PROVIDER = process.env.SERVICE_PROVIDER || ''
const ROOT_ORG_ID = process.env.ROOT_ORG_ID || 'hy-university-root-id'
const KORI_API_BASE_URL = `${process.env.SIS_API_URL}/kori/api`
const KORI_PUBLIC_API_URL = SERVICE_PROVIDER === 'fd' ? KORI_API_BASE_URL : 'https://sisu.helsinki.fi/kori/api'

module.exports = {
  PORT,
  REDIS_HOST,
  REDIS_PORT,
  REJECT_UNAUTHORIZED,
  SONIC,
  CURRENT_EXECUTION_HASH,
  FETCH_AMOUNT,
  MAX_CHUNK_SIZE,
  IS_DEV,
  APIS,
  UPDATE_RETRY_LIMIT,
  PANIC_TIMEOUT,
  SERVICE_PROVIDER,
  ROOT_ORG_ID,
  KORI_PUBLIC_API_URL,
  KORI_API_BASE_URL
}
