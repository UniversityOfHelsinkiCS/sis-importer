const express = require('express')

const models = require('../models')
const { NotFoundError } = require('../errors')

const router = express.Router()

/**
 * Person object by employee number
 */
router.get('/:id', async (req, res) => {
  try {
    const staffId = req.params.id
    if (!staffId) return res.send(null)
    const employee = await models.Person.findAll({
      where: {
        employeeNumber: staffId
      }
    })
    if (!employee) throw new NotFoundError(`Employee with id ${staffId} does not exist`)

    return res.send(employee)
  } catch (e) {
    console.log(e)
    res.status(500).json(e.toString())
  }
})

/**
 * Is the person even an employee?
 * id is the sisuId.
 */
router.get('/:id/is_employee', async (req, res) => {
  const { id } = req.params

  const employee = await models.Person.findByPk(id, {
    attributes: ['employeeNumber']
  })

  res.send(!!employee.employeeNumber)
})

module.exports = router
