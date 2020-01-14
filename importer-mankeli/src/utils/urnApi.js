const axios = require('axios')
const { retry } = require('./index')
const { get: redisGet, set: redisSet, expire: redisExpire } = require('./redis')

const COUNTRY_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:country'
const GENDER_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:gender'
const COURSE_UNIT_TYPE_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:course-unit-type'
const COURSE_UNIT_REALISATION_TYPE_URN =
  'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:course-unit-realisation-type'
const ASSESSMENT_ITEM_TYPE_URN =
  'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:assessment-item-type'
const EDUCATION_TYPE_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:education-type'

const STUDY_LEVEL_URN = 'https://sis-helsinki.funidata.fi/kori/api/cached/codebooks/urn:code:study-level'

const get = async url => {
  const redisHit = await redisGet(url)
  if (redisHit) {
    return JSON.parse(redisHit)
  }

  const result = await retry(axios.get, [url])
  await redisSet(url, JSON.stringify(result.data))
  await redisExpire(url, 3600)
  return result.data
}

const getCountries = async () => await get(COUNTRY_URN)

const getGenders = async () => await get(GENDER_URN)

const getCourseUnitTypes = async () => await get(COURSE_UNIT_TYPE_URN)

const getCourseUnitRealisationTypes = async () => await get(COURSE_UNIT_REALISATION_TYPE_URN)

const getAssessmentItemTypes = async () => await get(ASSESSMENT_ITEM_TYPE_URN)

const getEducationTypes = async () => await get(EDUCATION_TYPE_URN)

const getStudyLevels = async () => await get(STUDY_LEVEL_URN)

module.exports = {
  getCountries,
  getGenders,
  getCourseUnitTypes,
  getCourseUnitRealisationTypes,
  getAssessmentItemTypes,
  getEducationTypes,
  getStudyLevels
}
