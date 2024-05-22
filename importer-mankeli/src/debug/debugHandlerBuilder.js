const { logger } = require('../utils/logger')

let counter = 5

const interestingItems = []

const debugPrinter = (channel, object) => {
  const string = `[DEBUGGER_${channel}] Item of interest found: \n${JSON.stringify(
    {
      object
    },
    null,
    2
  )}\n`
  logger.info(string)
  interestingItems.push(string)
  counter -= 1
  if (counter === 0) {
    counter = 5
    logger.info('INTERESTING_ITEMS')
    interestingItems.forEach(item => logger.info(item))
  }
}

const createDebugHandler = (channel, matcher, format) => {
  return {
    channel,
    handler: msg => {
      const entitiesOfInterest = msg.entities.filter(matcher)
      if (entitiesOfInterest.length > 0) {
        try {
          entitiesOfInterest.forEach(obj => debugPrinter(channel, format(obj)))
          /* eslint-disable-next-line no-empty */
        } catch (e) {}
      }
      return msg
    }
  }
}

module.exports = { createDebugHandler }
