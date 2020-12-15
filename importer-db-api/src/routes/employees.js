const express = require('express')
const { Op } = require('sequelize')

const models = require('../models')

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
        if (!employee) throw new NotFoundError(`Employee with id ${id} does not exist`)

        return res.send(employee)
    } catch (e) {
        console.log(e)
        res.status(500).json(e.toString())
    }
})
  
module.exports = router
  