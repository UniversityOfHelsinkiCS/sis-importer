const { ATTAINMENT_SCHEDULE_ID, info: attainmentInfo } = require('./attainment')
const { PERSON_SCHEDULE_ID, info: personInfo } = require('./person')
const { STUDY_RIGHT_SCHEDULE_ID, info: studyRightInfo } = require('./studyRight')
const { COURSE_UNIT_SCHEDULE_ID, info: courseUnitInfo } = require('./courseUnit')
const { COURSE_UNIT_REALISATION_SCHEDULE_ID, info: courseUnitRealisationInfo } = require('./courseUnitRealisation')
const { ASSESSMENT_ITEM_SCHEDULE_ID, info: assessmentItemInfo } = require('./assessmentItem')
const { EDUCATION_SCHEDULE_ID, info: educationInfo } = require('./education')
const { MODULE_SCHEDULE_ID, info: moduleInfo } = require('./module')
const { ORGANISATION_SCHEDULE_ID, info: organisationInfo } = require('./organisation')
const { TERM_REGISTRATION_SCHEDULE_ID, info: termRegistrationInfo } = require('./termRegistration')
const { STUDY_LEVEL_SCHEDULE_ID, info: studyLevelInfo } = require('./studyLevel')
const { GRADE_SCALE_SCHEDULE_ID, info: gradeScaleInfo } = require('./gradeScale')
const { COUNTRY_SCHEDULE_ID, info: countryInfo } = require('./country')

const services = {
  [ATTAINMENT_SCHEDULE_ID]: attainmentInfo,
  [PERSON_SCHEDULE_ID]: personInfo,
  [STUDY_RIGHT_SCHEDULE_ID]: studyRightInfo,
  [COURSE_UNIT_SCHEDULE_ID]: courseUnitInfo,
  [COURSE_UNIT_REALISATION_SCHEDULE_ID]: courseUnitRealisationInfo,
  [ASSESSMENT_ITEM_SCHEDULE_ID]: assessmentItemInfo,
  [EDUCATION_SCHEDULE_ID]: educationInfo,
  [MODULE_SCHEDULE_ID]: moduleInfo,
  [ORGANISATION_SCHEDULE_ID]: organisationInfo,
  [TERM_REGISTRATION_SCHEDULE_ID]: termRegistrationInfo,
  [STUDY_LEVEL_SCHEDULE_ID]: studyLevelInfo,
  [GRADE_SCALE_SCHEDULE_ID]: gradeScaleInfo,
  [COUNTRY_SCHEDULE_ID]: countryInfo
}

// Imported in this order
const serviceIds = [
  PERSON_SCHEDULE_ID,
  ORGANISATION_SCHEDULE_ID,
  COURSE_UNIT_SCHEDULE_ID,
  EDUCATION_SCHEDULE_ID,
  STUDY_RIGHT_SCHEDULE_ID,
  TERM_REGISTRATION_SCHEDULE_ID,
  ASSESSMENT_ITEM_SCHEDULE_ID,
  COURSE_UNIT_REALISATION_SCHEDULE_ID,
  ATTAINMENT_SCHEDULE_ID,
  MODULE_SCHEDULE_ID,
  STUDY_LEVEL_SCHEDULE_ID,
  GRADE_SCALE_SCHEDULE_ID,
  COUNTRY_SCHEDULE_ID
]

module.exports = {
  services,
  serviceIds
}
