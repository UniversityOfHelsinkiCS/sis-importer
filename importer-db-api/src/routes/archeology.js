const router = require('express').Router()
const models = require('../models')

router.get('/:studentNumber/studyrights', async (req, res) => {
    try {
        const student = await models.Person.findOne({
            where: {
                studentNumber: req.params.studentNumber,
            }
        })

        if (!student)
            return res.status(404).send('Student not found')

        const studyRights = await models.StudyRight.findAll({
            where: {
                personId: student.id,
                documentState: 'ACTIVE'
            },
            order: [['modificationOrdinal', 'DESC']],
            raw: true
        })
        if (!studyRights.length) return res.json([])

        const distinctStudyRights = []
        for (const studyRight of studyRights) {
            if (!distinctStudyRights.find(s => JSON.stringify(s.acceptedSelectionPath) === JSON.stringify(studyRight.acceptedSelectionPath))) {
                const education = await models.Education.findOne({
                    where: { id: studyRight.educationId },
                    raw: true
                })
                distinctStudyRights.push({ ...studyRight, person: student, education })
            }
        }
        return res.json(distinctStudyRights)

    } catch (e) {
        console.log(e)
        res.status(500).json(e.toString())
    }
})

module.exports = router
