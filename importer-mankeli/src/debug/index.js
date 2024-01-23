const attainmentDebug = require('./customHandlers/attainmentDebug')
const { createDebugHandler } = require('./debugHandlerBuilder')

// Create handler in customhandler folder. Import it and add it in this array.
const debugHandlers = [attainmentDebug].map(({ channel, matcher, format }) => createDebugHandler(channel, matcher, format))

module.exports = {
  debugHandlers
}
