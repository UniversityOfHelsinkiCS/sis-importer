const { Enrolment } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseEnrolment = ({
  id,
  personId,
  verifierPersonId,
  studyRightId,
  assessmentItemId,
  courseUnitRealisationId,
  courseUnitId,
  enrolmentDateTime,
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
  state,
  modificationOrdinal: metadata.modificationOrdinal
})

module.exports = async ({ active, deleted }, transaction) => {
  const parsedStudyRights = [...active, ...deleted].map(parseEnrolment)
  await bulkCreate(Enrolment, parsedStudyRights, transaction, ['id', 'modificationOrdinal', 'autoId'])
}
