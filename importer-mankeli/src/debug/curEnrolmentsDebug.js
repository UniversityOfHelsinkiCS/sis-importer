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

const debugHandler = enrolment => {
  logger.info(`[ENROLMENT_DEBUGGER] Enrolment of interest found ${JSON.stringify(enrolment)}`)
  Sentry.captureMessage(`[ENROLMENT_DEBUGGER] Enrolment of interest found ${JSON.stringify(enrolment)}`)
}

module.exports = {
  channel,
  handler: msg => {
    if (matcher(msg)) {
      debugHandler(msg)
    }
    return msg
  }
}
