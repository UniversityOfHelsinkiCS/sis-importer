const router = require('express').Router()

router.get('/min_max_semesters', async (req, res) => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const min = '2008-08-01' // fuksilaiterekisteri specific

  // Incicates when the *current* semester started
  const max = now < new Date(`${currentYear}-08-01`) ? `${currentYear-1}-08-01` : `${currentYear}-08-01`

  res.json({
    min,
    max,
  })
})

module.exports = router
