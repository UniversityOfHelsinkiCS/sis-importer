const { Location } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseLocation = location => {
  return {
    id: location.id,
    universityOrgIds: location.universityOrgIds,
    name: location.name,
    capacity: location.capacity,
    buildingId: location.buildingId,
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(Location, active.map(parseLocation), transaction)
  await bulkDelete(Location, deleted, transaction)
}
