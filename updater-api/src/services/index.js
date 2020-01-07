const { ATTAINMENT_SCHEDULE_ID, info: attainmentInfo } = require('./attainment')
const { PERSON_SCHEDULE_ID, info: personInfo } = require('./person')
const { STUDY_RIGHT_SCHEDULE_ID, info: studyRightInfo } = require('./studyRight')
const { COURSE_UNIT_SCHEDULE_ID, info: courseUnitInfo } = require('./courseUnit')
const { COURSE_UNIT_REALISATION_SCHEDULE_ID, info: courseUnitRealisationInfo } = require('./courseUnitRealisation')
const { ASSESSMENT_ITEM_SCHEDULE_ID, info: assessmentItemInfo } = require('./assessmentItem')

const services = {
  [ATTAINMENT_SCHEDULE_ID]: attainmentInfo,
  [PERSON_SCHEDULE_ID]: personInfo,
  [STUDY_RIGHT_SCHEDULE_ID]: studyRightInfo,
  [COURSE_UNIT_SCHEDULE_ID]: courseUnitInfo,
  [COURSE_UNIT_REALISATION_SCHEDULE_ID]: courseUnitRealisationInfo,
  [ASSESSMENT_ITEM_SCHEDULE_ID]: assessmentItemInfo
}

const serviceIds = [
  PERSON_SCHEDULE_ID,
  ATTAINMENT_SCHEDULE_ID,
  STUDY_RIGHT_SCHEDULE_ID,
  COURSE_UNIT_SCHEDULE_ID,
  COURSE_UNIT_REALISATION_SCHEDULE_ID,
  ASSESSMENT_ITEM_SCHEDULE_ID
]

module.exports = {
  services,
  serviceIds
}
