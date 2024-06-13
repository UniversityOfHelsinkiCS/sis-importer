const { Organisation } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseOrganisation = organisation => {
  return {
    id: organisation.id,
    documentState: organisation.documentState,
    snapshotDateTime: organisation.snapshotDateTime,
    universityOrgId: organisation.universityOrgId,
    parentId: organisation.parentId,
    predecessorIds: organisation.predecessorIds,
    code: organisation.code,
    name: organisation.name,
    abbreviation: organisation.abbreviation,
    status: organisation.status,
    educationalInstitutionUrn: organisation.educationalInstitutionUrn,
    modificationOrdinal: organisation.metadata.modificationOrdinal
  }
}

// Organisations need to be written into
// the db in a similar fashion as studyrights.
module.exports = async ({ active, deleted }, transaction) => {
  const parsedOrganisations = [...active, ...deleted].map(parseOrganisation)
  await bulkCreate(Organisation, parsedOrganisations, transaction, ['id', 'modification_ordinal', 'auto_id'])
}
