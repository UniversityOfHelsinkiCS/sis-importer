const router = require('./palaute')
const { createPersonStudyRightsView } = require('./personStudyRightsView')

const runAfterDelay = async () => {
  await new Promise(r => setTimeout(r, 1000))
  await createPersonStudyRightsView()
}

runAfterDelay()

module.exports = router
