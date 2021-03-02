const { EducationClassification } = require('../db/models')
const { bulkCreate } = require('../utils/db')

module.exports = async ({ active }, transaction) => {
  await bulkCreate(EducationClassification, active, transaction)
}
