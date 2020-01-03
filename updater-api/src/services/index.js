const { ATTAINMENTS_SCHEDULE_ID, info: attainmentsInfo } = require('./attainment')
const { PERSON_SCHEDULE_ID, info: personInfo } = require('./person')
const { STUDY_RIGHT_SCHEDULE_ID, info: studyRightInfo } = require('./studyRight')

const services = {
  [ATTAINMENTS_SCHEDULE_ID]: attainmentsInfo,
  [PERSON_SCHEDULE_ID]: personInfo,
  [STUDY_RIGHT_SCHEDULE_ID]: studyRightInfo
}

const serviceIds = [PERSON_SCHEDULE_ID, ATTAINMENTS_SCHEDULE_ID, STUDY_RIGHT_SCHEDULE_ID]

module.exports = {
  services,
  serviceIds
}
