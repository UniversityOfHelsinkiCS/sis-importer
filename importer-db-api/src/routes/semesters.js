const router = require('express').Router()
const models = require('../models')

router.get('/min_max_semesters', async (req, res) => {
  try {
    const now = new Date().getTime()
    const all = await models.StudyYear.findAll()
    const min = '2008-08-01' // fuksilaiterekisteri specific

    const max = all.find(({ valid }) => {
      return new Date(valid.endDate).getTime() > now && new Date(valid.startDate).getTime() <= now
    }).valid.startDate

    res.status(200).json({
      min,
      max,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

module.exports = router
