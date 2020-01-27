const { StudyRight } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseStudyRight = studyRight => {
  return {
    id: studyRight.id,
    personId: studyRight.studentId,
    educationId: studyRight.educationId,
    organisationId: studyRight.organisationId,
    state: studyRight.state,
    documentState: studyRight.documentState,
    valid: studyRight.valid,
    grantDate: studyRight.grantDate,
    studyStartDate: studyRight.studyStartDate,
    transferOutDate: studyRight.transferOutDate,
    termRegistrations: studyRight.termRegistrations,
    studyRightCancellation: studyRight.studyRightCancellation,
    studyRightGraduation: studyRight.studyRightGraduation,
    snapshotDateTime: studyRight.snapshotDateTime,
    acceptedSelectionPath: studyRight.acceptedSelectionPath,
    modificationOrdinal: studyRight.metadata.modificationOrdinal
  }
}

// Studyrights are a bit special compared to other entities. There can be
// different instances of the same studyright id (snapshots) and we want to
// save all of them. Thus we can't use id as the primary key. We also don't
// want to delete any studyrights even if their state is deleted.
module.exports = async ({ active, deleted, executionHash }, transaction) => {
  const parsedStudyRights = [...active, ...deleted].map(parseStudyRight)
  await bulkCreate(StudyRight, parsedStudyRights, transaction, ['id', 'modificationOrdinal', 'autoId'])

  return { executionHash }
}
