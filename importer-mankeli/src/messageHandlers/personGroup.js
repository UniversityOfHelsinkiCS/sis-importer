const { bulkCreate, bulkDelete } = require('../utils/db')
const { PersonGroup } = require('../db/models')

const parsePersonGroup = personGroup => {
  return {
    id: personGroup.id,
    name: personGroup.name,
    responsibilityInfos: personGroup.responsibilityInfos,
    type: personGroup.type
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(PersonGroup, active.map(parsePersonGroup), transaction)
  await bulkDelete(PersonGroup, deleted, transaction)
}
