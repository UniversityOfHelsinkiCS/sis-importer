const { StudyRightExpirationRule } = require('../db/models')
const { bulkCreate } = require('../utils/db')

module.exports = async ({ active }, transaction) => {
  await bulkCreate(StudyRightExpirationRule, active, transaction)
}
