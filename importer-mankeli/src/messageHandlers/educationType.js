const { EducationType } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseEducationTypes = educationType => ({
  id: educationType.id,
  parentId: educationType.parentUrn,
  name: educationType.name
})

module.exports = async ({ active }, transaction) => {
  await bulkCreate(EducationType, active.map(parseEducationTypes), transaction)
}
