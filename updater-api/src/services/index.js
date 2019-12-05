const { ATTAINMENTS_SCHEDULE_ID, info: attainmentsInfo } = require('./attainments')
const { PERSON_SCHEDULE_ID, info: personInfo } = require('./person')

const services = {
  [ATTAINMENTS_SCHEDULE_ID]: attainmentsInfo,
  [PERSON_SCHEDULE_ID]: personInfo
}

const serviceIds = [PERSON_SCHEDULE_ID, ATTAINMENTS_SCHEDULE_ID]

module.exports = {
  services,
  serviceIds
}
