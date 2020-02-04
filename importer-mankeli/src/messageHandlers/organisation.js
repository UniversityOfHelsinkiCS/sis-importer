const { flatten } = require('lodash')
const { Organisation, StudyYear } = require('../db/models')
const { bulkCreate } = require('../utils/db')
const { koriRequest } = require('../utils/koriApi')

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

const parseStudyYears = studyYear => {
  return {
    startYear: studyYear.startYear,
    name: studyYear.name,
    valid: studyYear.valid,
    org: studyYear.org,
    studyTerms: studyYear.studyTerms
  }
}

// Organisations need to be written into
// the db in a similar fashion as studyrights.
module.exports = async ({ active, deleted }, transaction) => {
  const parsedOrganisations = [...active, ...deleted].map(parseOrganisation)
  await bulkCreate(Organisation, parsedOrganisations, transaction, ['id', 'modificationOrdinal', 'autoId'])

  // Fetch and write all universities' study years into the db.
  const uniqueUniversityOrganisations = await Organisation.aggregate('university_org_id', 'DISTINCT', { plain: false })
  const studyYears = await Promise.all(
    uniqueUniversityOrganisations.map(async ({ DISTINCT: orgId }) => {
      const orgStudyYears = await koriRequest(
        `/study-years/v1?&organisationId=${orgId}&firstYear=1950&numberOfYears=1000`
      )
      return orgStudyYears.map(parseStudyYears)
    })
  )

  await bulkCreate(StudyYear, flatten(studyYears), transaction, ['startYear'])
}
