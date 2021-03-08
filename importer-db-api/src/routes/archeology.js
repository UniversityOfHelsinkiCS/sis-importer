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

        const { openUni: includeOpenUni } = req.query

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

router.get('/:studentNumber/enrollments', async (req, res) => {
    try {
        const student = await models.Person.findOne({
            where: {
                studentNumber: req.params.studentNumber,
            }
        })
        if (!student)
            return res.status(404).send('Student not found')

        const enrolments = await models.Enrolment.findAll({
            where: {
                personId: student.id
            },
            order: [['enrolmentDateTime', 'DESC']],
            limit: req.query.limit || null,
            raw: true
        })

        const mankeled = await Promise.all(enrolments.map(async (e) => {
            const assessmentItem = await models.AssessmentItem.findOne({ where: { id: e.assessmentItemId } })
            const courseUnit = await models.CourseUnit.findOne({ where: { id: e.courseUnitId } })
            const courseUnitRealisation = await models.CourseUnitRealisation.findOne({ where: { id: e.courseUnitRealisationId } })
            return Promise.resolve({ ...e, assessmentItem, courseUnit, courseUnitRealisation })
        }))
        return res.send(mankeled)
    } catch (e) {
        console.log(e)
        res.status(500).json(e.toString())
    }
})

router.get('/assessments/:code', async (req, res) => {
    try {
        const courseUnit = await models.CourseUnit.findOne({
            where: {
                code: req.params.code,
            },
            raw: true
        })
        if (!courseUnit)
            return res.status(404).send('Course not found')

        const assessmentItems = await models.AssessmentItem.findAll({
            where: { primaryCourseUnitGroupId: courseUnit.groupId },
            raw: true

        })
        return res.send({ courseUnit, assessmentItems })
    } catch (e) {
        console.log(e)
        res.status(500).json(e.toString())
    }
})

module.exports = router
