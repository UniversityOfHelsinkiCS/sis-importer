const router = require('express').Router()
const models = require('../models')
const { Op } = require('sequelize')

router.get('/:studentNumber/studyrights', async (req, res) => {
    try {
        const student = await models.Person.findOne({
            where: {
                studentNumber: req.params.studentNumber,
            }
        })

        const {openUni: includeOpenUni} = req.query

        if (!student)
            return res.status(404).send('Student not found')

        const studyRights = await models.StudyRight.findAll({
            where: { personId: student.id },
            order: [['modificationOrdinal', 'DESC']],
            raw: true
        })
        if (!studyRights.length) return res.json([])

        const mankeledStudyRights = []
        for (const studyRight of studyRights) {
            const { educationPhase1GroupId, educationPhase2GroupId } = studyRight.acceptedSelectionPath || {}
            const education = await models.Education.findOne({
                where: { id: studyRight.educationId },
                raw: true
            })
            if (!includeOpenUni && education && education.educationType.includes('open-university-studies'))
                continue
            const additionalData = { education, person: student }

            if (educationPhase1GroupId)
                additionalData.educationPhase1 = await models.Module.findOne({
                    where: { groupId: educationPhase1GroupId },
                    raw: true
                })
            if (educationPhase2GroupId)
                additionalData.educationPhase2 = await models.Module.findOne({
                    where: { groupId: educationPhase2GroupId },
                    raw: true
                })
            mankeledStudyRights.push({ ...studyRight, ...additionalData })
        }
        return res.json(mankeledStudyRights)

    } catch (e) {
        console.log(e)
        res.status(500).json(e.toString())
    }
})

// Probably CPU usage > inf
router.get('/assessments', async (req, res) => {
    try {
        const courseUnits = await models.CourseUnit.findAll({
            where: {
                code: { [Op.iLike]: '%TKT%' }
            },
            raw: true
        })
        const assessmentItems = await models.AssessmentItem.findAll({
            where: {
                primaryCourseUnitGroupId: {
                    [Op.in]: courseUnits.map(({ groupId }) => groupId)
                }
            },
            raw: true
        })
        const realisations = await models.CourseUnitRealisation.findAll({
            where: {
                assessmentItemIds: {
                    [Op.overlap]: assessmentItems.map(({ id }) => id)
                }
            },
            raw: true
        })
        console.log(`GOT ${realisations.length} realisations`)
        const wat = realisations.filter(r => r.assessmentItemIds.length > 1)
        return res.send(wat)
    } catch (e) {
        console.log(e)
        res.status(500).json(e.toString())
    }
})

router.get('/:studentNumber/attainments', async (req, res) => {
    try {
        const student = await models.Person.findOne({
            where: {
                studentNumber: req.params.studentNumber,
            }
        })

        if (!student)
            return res.status(404).send('Student not found')

        const attainments = await models.Attainment.findAll({
            where: {
                personId: student.id
            },
            raw: true
        })

        const attainmentsWithCourses = await Promise.all(
            attainments.map(async (a) => {
                const courseUnit = await models.CourseUnit.findOne({
                    where: {
                        id: a.courseUnitId
                    }
                })
                return Promise.resolve({ ...a, courseUnit })
            })
        )

        if (req.query.code)
            return res.send(attainmentsWithCourses.filter(a =>
                a.courseUnit && a.courseUnit.code.includes(req.query.code)
            ))
        return res.send(attainmentsWithCourses)
    } catch (e) {
        console.log(e)
        res.status(500).json(e.toString())
    }
})

module.exports = router
