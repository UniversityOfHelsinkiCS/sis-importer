const express = require('express')
const { relevantAttributes, masterThesisCourseCode } = require('./config')
const models = require('../../models')
const { sequelize } = require('../../config/db')
const { isRefreshingPersonStudyRightsView } = require('../palaute/personStudyRightsView')
const { Op } = require('sequelize')

const router = express.Router()

const grapaRouter = express.Router()

grapaRouter.get('/masters-attainments/:orgCode', async (req, res) => {
  const { limit, offset, personIds } = req.query

  if (!limit || !offset || !personIds) return res.sendStatus(400)

  const organisation = await models.Organisation.findOne({
    where: {
      code: req.params.orgCode
    }
  })

  if (!organisation) return res.sendStatus(404)

  const studentAttainments = await models.Attainment.findAll({
    attributes: ['id', 'personId', 'courseUnitId', 'state', 'attainmentDate', 'registrationDate'],
    where: {
      state: 'ATTAINED',
      personId: personIds
    },
    include: [
      {
        attributes: ['id', 'code', 'organisations'],
        model: models.CourseUnit,
        as: 'courseUnit',
        where: {
          courseUnitType: masterThesisCourseCode,
          organisations: {
            [Op.contains]: [
              {
                organisationId: organisation.id
              }
            ]
          }
        }
      }
    ],
    limit,
    offset
  })

  res.send(studentAttainments)
})

grapaRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  if (isRefreshingPersonStudyRightsView()) {
    return res.send({
      waitAndRetry: true,
      message: 'Person study rights view is being refreshed',
      waitTime: 10_000
    })
  }

  const personsWithStudyRightOrEmployeeNumber = await sequelize.query(
    `SELECT ${relevantAttributes.persons.map(attr => `P.${attr}`)}, psr.has_study_right AS "hasStudyRight"
      FROM persons P
      LEFT JOIN person_study_rights_view psr ON psr.person_id = P.id
      WHERE has_study_right IS TRUE OR employee_number IS NOT NULL
      ORDER BY P.id DESC
      LIMIT :limit OFFSET :offset`,
    {
      replacements: {
        limit,
        offset
      },
      mapToModel: true,
      model: models.Person
    }
  )

  const personIds = personsWithStudyRightOrEmployeeNumber.map(person => person.id)

  if (!personIds.length) return res.send([])

  const studyRights = await models.StudyRight.findAll({
    where: {
      personId: personIds
    },
    order: [
      ['personId', 'ASC'],
      ['id', 'DESC'],
      ['modificationOrdinal', 'DESC']
    ],
    include: [models.Organisation, models.Education],
    raw: true,
    nest: true
  })

  const seenStudyRights = new Set()
  const latestStudyRights = studyRights.filter(studyRight => {
    const studyRightKey = `${studyRight.personId}:${studyRight.id}`

    if (seenStudyRights.has(studyRightKey)) return false

    seenStudyRights.add(studyRightKey)
    return true
  })

  const moduleGroupIds = [
    ...new Set(
      latestStudyRights
        .map(studyRight => studyRight.education?.groupId)
        .filter(Boolean)
        .map(groupId => groupId.replace('EDU', 'DP'))
    )
  ]

  const modules = moduleGroupIds.length
    ? await models.Module.findAll({
        where: {
          groupId: moduleGroupIds
        },
        attributes: ['groupId', 'code'],
        raw: true
      })
    : []

  const moduleCodeByGroupId = modules.reduce((acc, module) => {
    acc[module.groupId] = module.code
    return acc
  }, {})

  const studyRightsByPersonId = latestStudyRights.reduce((acc, studyRight) => {
    const moduleGroupId = studyRight.education?.groupId?.replace('EDU', 'DP')
    const moduleCode = moduleGroupId ? moduleCodeByGroupId[moduleGroupId] : undefined
    const formattedStudyRight = {
      faculty_code: studyRight.organisation?.code,
      elements: [
        {
          code: moduleCode,
          start_date: studyRight.valid?.startDate,
          end_date: studyRight.valid?.endDate
        }
      ],
      id: studyRight.id,
      valid: {
        start_date: studyRight.valid?.startDate,
        end_date: studyRight.valid?.endDate
      }
    }

    if (!acc[studyRight.personId]) acc[studyRight.personId] = []
    acc[studyRight.personId].push(formattedStudyRight)
    return acc
  }, {})

  const personsWithStudyRights = personsWithStudyRightOrEmployeeNumber.map(person => ({
    ...person.toJSON(),
    studyRights: studyRightsByPersonId[person.id] || []
  }))

  res.send(personsWithStudyRights)
})

grapaRouter.get('/studytracks', async (req, res) => {
  const { limit, offset, codes } = req.query
  if (!limit || !offset || !codes) return res.sendStatus(400)

  const programmes = (
    await models.Module.findAll({
      where: {
        code: codes
      }
    })
  ).filter(p => !p.validityPeriod?.endDate)

  if (programmes.length === 0) return res.send([])

  const [studytracks] = await sequelize.query(
    `
      SELECT distinct on (lower(m.name->>'fi')) m.name, m.id, s.accepted_selection_path->>'educationPhase2GroupId' as "programGroupId"
      FROM "modules" m
      JOIN "studyrights" s ON m."group_id" = s.accepted_selection_path->>'educationPhase2ChildGroupId'
      WHERE s.accepted_selection_path->>'educationPhase2GroupId' IN (:ids)
        AND m.validity_period->>'endDate' IS NULL
        AND s.document_state = 'ACTIVE'
      ORDER BY lower(m.name->>'fi'), m.validity_period DESC
      LIMIT :limit OFFSET :offset
    `,
    {
      replacements: {
        ids: programmes.map(p => p.groupId),
        limit,
        offset
      }
    }
  )

  const studyTracksWithProgramCodes = studytracks.map(st => ({
    ...st,
    programCode: programmes.find(p => p.groupId === st.programGroupId).code
  }))

  // filter the incomplete entries that do not have a name in all languages
  res.send(studyTracksWithProgramCodes.filter(st => st.name.fi && st.name.en && st.name.sv))
})

router.use('/', grapaRouter)

module.exports = router
