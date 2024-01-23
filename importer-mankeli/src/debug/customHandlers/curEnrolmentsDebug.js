const { ILMO_ENROLMENT_CHANNEL } = require('../../utils/stan')

const matcher = enrolment => enrolment.courseUnitRealisationId === 'hy-opt-cur-2324-f0c0d370-0087-4bb9-93aa-387e76bd11f2'

const format = ({ 
  id,
  state,
  personId,
  documentState,
  metadata 
}) => ({
    id,
    state,
    personId,
    documentState,
    lastModifiedOn: metadata.lastModifiedOn,
    modificationOrdinal: metadata.modificationOrdinal
  })

module.exports = {
  channel: ILMO_ENROLMENT_CHANNEL,
  matcher,
  format
}
