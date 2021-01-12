const express = require('express')

const models = require('../models')

const router = express.Router()

router.get('/:id', async (req, res) => {
    const { id } = req.params

    const gradeScale = await models.GradeScale.findOne({
        where: { id }
    })

    if (!gradeScale) return res.status(404).send(`Garde scale with id ${id} does not exist`)

    res.send(gradeScale.grades)
})

module.exports = router
