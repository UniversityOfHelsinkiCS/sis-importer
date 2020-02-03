const { bulkCreate } = require('../utils/db')
const { StudyLevel } = require('../db/models')

module.exports = async ({ active }, transaction) => {
  await bulkCreate(StudyLevel, active, transaction)
}
