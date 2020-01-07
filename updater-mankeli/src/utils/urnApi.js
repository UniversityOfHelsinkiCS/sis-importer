const axios = require('axios')
const { retry } = require('./index')
const { get: redisGet, set: redisSet, expire: redisExpire } = require('./redis')

const COUNTRY_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:country'
const GENDER_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:gender'
const COURSE_UNIT_TYPE_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:course-unit-type'
const COURSE_UNIT_REALISATION_TYPE_URN =
  'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:course-unit-realisation-type'

const get = async url => {
  const redisHit = await redisGet(url)
  if (redisHit) {
    return JSON.parse(redisHit)
  } else {
    const result = await retry(axios.get, [url])
    await redisSet(url, JSON.stringify(result.data))
    await redisExpire(url, 3600)
    return result.data
  }
}

const getCountries = async () => await get(COUNTRY_URN)

const getGenders = async () => await get(GENDER_URN)

const getCourseUnitTypes = async () => await get(COURSE_UNIT_TYPE_URN)

const getCourseUnitRealisationTypes = async () => await get(COURSE_UNIT_REALISATION_TYPE_URN)

module.exports = {
  getCountries,
  getGenders,
  getCourseUnitTypes,
  getCourseUnitRealisationTypes
}
