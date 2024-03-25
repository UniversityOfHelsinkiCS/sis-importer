const { Op } = require('sequelize')
const express = require('express')
const models = require('../../models')

const router = express.Router()

const curreRouter = express.Router()

curreRouter.get('/enrolments-new', async (req, res) => {
  const { since: sinceRaw } = req.query

  const since = new Date(sinceRaw)

  if (!sinceRaw || since == 'Invalid Date') {
    return res.status(400).send({ message: 'Missing or invalid query parameter since' })
  }
  
  const enrolments = await models.Enrolment.findAll({
    where: {
      state: 'ENROLLED',
      enrolmentDateTime: {
        [Op.gte]: since,
      },
    },
    attributes: [
      'id',
      'state',
      'personId',
      'assessmentItemId',
      'courseUnitRealisationId',
      'courseUnitId',
      'confirmedStudySubGroupIds',
      'documentState',
    ],
    order: [['id', 'DESC']],
  })

  res.send(enrolments)
})

router.use('/updater', curreRouter)

module.exports = router