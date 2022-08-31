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
const { COUNTRY_SCHEDULE_ID, info: countryInfo } = require('./country')
const { EDUCATION_TYPE_SCHEDULE_ID, info: educationTypeInfo } = require('./educationType')
const { STUDY_RIGHT_PRIMALITY_SCHEDULE_ID, info: studyRightPrimalityInfo } = require('./studyRightPrimality')
const { ENROLMENT_SCHEDULE_ID, info: enrolmentInfo } = require('./enrolments')
const { GRAPHQL_GRADE_SCALES_SCHEDULE_ID, info: gradeScalesInfo } = require('./gradeScales')
const { DEGREE_TITLE_SCHEDULE_ID, info: degreeTitleInfo } = require('./degreeTitle')
const { EDUCATION_CLASSIFICATION_SCHEDULE_ID, info: educationClassificationInfo } = require('./educationClassification')
const { PLAN_SCHEDULE_ID, info: planInfo } = require('./plan')
const { PERSON_GROUP_SCHEDULE_ID, info: personGroupInfo } = require('./personGroups')

const {
  STUDY_RIGHT_EXPIRATION_RULE_SCHEDULE_ID,
  info: studyRightExpirationRuleInfo
} = require('./studyRightExpirationRule')
const { ADMISSION_TYPE_SCHEDULE_ID, info: admissionTypeInfo } = require('./admissionType')
const { STUDY_EVENT_SCHEDULE_ID, info: studyEventInfo } = require('./studyEvents')

const services = {
  [ATTAINMENT_SCHEDULE_ID]: attainmentInfo,
  [PERSON_SCHEDULE_ID]: personInfo,
  [STUDY_RIGHT_SCHEDULE_ID]: studyRightInfo,
  [COURSE_UNIT_SCHEDULE_ID]: courseUnitInfo,
  [COURSE_UNIT_REALISATION_SCHEDULE_ID]: courseUnitRealisationInfo,
  [STUDY_EVENT_SCHEDULE_ID]: studyEventInfo,
  [ASSESSMENT_ITEM_SCHEDULE_ID]: assessmentItemInfo,
  [EDUCATION_SCHEDULE_ID]: educationInfo,
  [MODULE_SCHEDULE_ID]: moduleInfo,
  [ORGANISATION_SCHEDULE_ID]: organisationInfo,
  [TERM_REGISTRATION_SCHEDULE_ID]: termRegistrationInfo,
  [STUDY_LEVEL_SCHEDULE_ID]: studyLevelInfo,
  [COUNTRY_SCHEDULE_ID]: countryInfo,
  [EDUCATION_TYPE_SCHEDULE_ID]: educationTypeInfo,
  [STUDY_RIGHT_PRIMALITY_SCHEDULE_ID]: studyRightPrimalityInfo,
  [ENROLMENT_SCHEDULE_ID]: enrolmentInfo,
  [GRAPHQL_GRADE_SCALES_SCHEDULE_ID]: gradeScalesInfo,
  [DEGREE_TITLE_SCHEDULE_ID]: degreeTitleInfo,
  [EDUCATION_CLASSIFICATION_SCHEDULE_ID]: educationClassificationInfo,
  [STUDY_RIGHT_EXPIRATION_RULE_SCHEDULE_ID]: studyRightExpirationRuleInfo,
  [ADMISSION_TYPE_SCHEDULE_ID]: admissionTypeInfo,
  [PLAN_SCHEDULE_ID]: planInfo,
  [PERSON_GROUP_SCHEDULE_ID]: personGroupInfo
}

// Imported in this order
const serviceIds = [
  /*PERSON_SCHEDULE_ID,
  ORGANISATION_SCHEDULE_ID,
  COURSE_UNIT_SCHEDULE_ID,
  EDUCATION_SCHEDULE_ID,
  STUDY_RIGHT_SCHEDULE_ID,
  TERM_REGISTRATION_SCHEDULE_ID,
  ASSESSMENT_ITEM_SCHEDULE_ID,
  COURSE_UNIT_REALISATION_SCHEDULE_ID,*/
  STUDY_EVENT_SCHEDULE_ID,
  /*ATTAINMENT_SCHEDULE_ID,
  MODULE_SCHEDULE_ID,
  STUDY_RIGHT_PRIMALITY_SCHEDULE_ID,
  STUDY_LEVEL_SCHEDULE_ID,
  COUNTRY_SCHEDULE_ID,
  EDUCATION_TYPE_SCHEDULE_ID,
  ENROLMENT_SCHEDULE_ID,
  GRAPHQL_GRADE_SCALES_SCHEDULE_ID,
  DEGREE_TITLE_SCHEDULE_ID,
  EDUCATION_CLASSIFICATION_SCHEDULE_ID,
  STUDY_RIGHT_EXPIRATION_RULE_SCHEDULE_ID,
  ADMISSION_TYPE_SCHEDULE_ID,
  PLAN_SCHEDULE_ID,
  PERSON_GROUP_SCHEDULE_ID*/
]

module.exports = {
  services,
  serviceIds
}
