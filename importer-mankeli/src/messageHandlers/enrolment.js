const { Enrolment } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseEnrolment = ({
  id,
  personId,
  documentState,
  verifierPersonId,
  studyRightId,
  assessmentItemId,
  courseUnitRealisationId,
  courseUnitId,
  enrolmentDateTime,
  studySubGroups,
  confirmedStudySubGroupIds,
  tentativeStudySubGroupIds,
  state,
  metadata
}) => ({
  id,
  personId,
  verifierPersonId,
  studyRightId,
  assessmentItemId,
  courseUnitRealisationId,
  courseUnitId,
  enrolmentDateTime,
  studySubGroups,
  confirmedStudySubGroupIds,
  tentativeStudySubGroupIds,
  state,
  documentState,
  lastModifiedOn: metadata.lastModifiedOn,
  modificationOrdinal: metadata.modificationOrdinal
})

module.exports = async ({ active, deleted }, transaction) => {
  const parsedEnrolments = [...active, ...deleted].map(parseEnrolment)
  await bulkCreate(Enrolment, parsedEnrolments, transaction, [])
}
