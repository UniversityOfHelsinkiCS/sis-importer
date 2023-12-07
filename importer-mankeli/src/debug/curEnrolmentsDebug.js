const Sentry = require('@sentry/node')
const { logger } = require('../utils/logger')
const { ILMO_ENROLMENT_CHANNEL } = require('../utils/stan')

const channel = ILMO_ENROLMENT_CHANNEL

const curId = 'hy-opt-cur-2324-f0c0d370-0087-4bb9-93aa-387e76bd11f2'

/**
 * Used to filter the enrolments of interest
 * @param {*} enrolment
 */
const matcher = enrolment => {
  return enrolment.courseUnitRealisationId === curId
}

const debugHandler = ({ id, state, personId, documentState, metadata }) => {
  logger.info(
    `[ENROLMENT_DEBUGGER] Enrolment of interest found ${JSON.stringify({
      id,
      state,
      personId,
      documentState,
      lastModifiedOn: metadata.lastModifiedOn,
      modificationOrdinal: metadata.modificationOrdinal
    })}`
  )
  Sentry.captureMessage(
    `[ENROLMENT_DEBUGGER] Enrolment of interest found ${JSON.stringify({
      id,
      state,
      personId,
      documentState,
      lastModifiedOn: metadata.lastModifiedOn,
      modificationOrdinal: metadata.modificationOrdinal
    })}`
  )
}

module.exports = {
  channel,
  handler: msg => {
    const entitiesOfInterest = msg.entities.filter(matcher)
    if (entitiesOfInterest.length > 0) {
      try {
        entitiesOfInterest.forEach(debugHandler)
        /* eslint-disable-next-line no-empty */
      } catch (e) {}
    }
    return msg
  }
}
