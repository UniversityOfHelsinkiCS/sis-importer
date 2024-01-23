const { ORI_ATTAINMENT_CHANNEL } = require('../../utils/stan')

const matcher = attainment => attainment.personId === 'RETRACTED'

const format = ({
  id, 
  personId, 
  state, 
  attainmentDate, 
  type, 
  credits, 
  documentState,
  metadata
}) => ({
  id, 
  personId, 
  state, 
  attainmentDate, 
  type, 
  credits, 
  documentState,
  lastModifiedOn: metadata.lastModifiedOn,
  modificationOrdinal: metadata.modificationOrdinal
})

module.exports = {
  channel: ORI_ATTAINMENT_CHANNEL,
  matcher,
  format
}
