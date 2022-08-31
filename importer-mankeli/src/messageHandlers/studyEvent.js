const { StudyEvent } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseStudyEvent = studyEvent => {
  return studyEvent
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(StudyEvent, active.map(parseStudyEvent), transaction)
  await bulkDelete(StudyEvent, deleted, transaction)
}
