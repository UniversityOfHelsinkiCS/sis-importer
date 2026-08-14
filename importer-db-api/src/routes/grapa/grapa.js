const express = require('express')
const { relevantAttributes, masterThesisCourseCode } = require('./config')
const models = require('../../models')
const { sequelize } = require('../../config/db')
const { isRefreshingPersonStudyRightsView } = require('../palaute/personStudyRightsView')
const { Op, QueryTypes } = require('sequelize')

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

  const studyRightsQuery = await sequelize.query(
    'SELECT S.id, S.valid, S.person_id, S.accepted_selection_path, E.group_id AS education_group_id FROM studyrights S LEFT JOIN educations E ON E.id = S.education_id WHERE S.person_id IN (:personids) ORDER BY S.person_id ASC, S.id DESC, S.modification_ordinal DESC',
    {
      replacements: {
        personids: personIds
      },
      type: QueryTypes.SELECT
    }
  )

  const studyRights = studyRightsQuery ? studyRightsQuery : []

  const seenStudyRights = new Set()
  const latestStudyRights = studyRights.filter(studyRight => {
    const studyRightKey = `${studyRight.person_id}:${studyRight.id}`
    if (seenStudyRights.has(studyRightKey)) return false

    seenStudyRights.add(studyRightKey)
    return true
  })

  const moduleGroupIds = [
    ...new Set(
      latestStudyRights
        .map(studyRight => {
          return [
            studyRight.education_group_id ? studyRight.education_group_id.replace('EDU', 'DP') : undefined,
            studyRight.accepted_selection_path?.educationPhase2ChildGroupId,
            studyRight.accepted_selection_path?.educationPhase1ChildGroupId,
            studyRight.accepted_selection_path?.educationPhase1GroupId,
            studyRight.accepted_selection_path?.educationPhase2GroupId
          ].filter(Boolean)
        })
        .flat()
    )
  ]

  const modules = moduleGroupIds.length
    ? await models.Module.findAll({
        where: {
          groupId: moduleGroupIds
        },
        attributes: ['groupId', 'code', 'id'],
        raw: true
      })
    : []

  const moduleCodeByGroupId = modules.reduce((acc, module) => {
    acc[module.groupId] = module
    return acc
  }, {})

  const studyRightsByPersonId = latestStudyRights.reduce((acc, studyRight) => {
    const educationModuleGroupId = studyRight.education_group_id?.replace('EDU', 'DP')

    const programmeStudytrackPairs = {}

    if (studyRight.accepted_selection_path?.educationPhase1GroupId)
      programmeStudytrackPairs[studyRight.accepted_selection_path?.educationPhase1GroupId] =
        studyRight.accepted_selection_path?.educationPhase1ChildGroupId

    if (studyRight.accepted_selection_path?.educationPhase2GroupId)
      programmeStudytrackPairs[studyRight.accepted_selection_path?.educationPhase2GroupId] =
        studyRight.accepted_selection_path?.educationPhase2ChildGroupId

    const selections = Array.from(
      new Set(
        [
          studyRight.education_group_id ? studyRight.education_group_id.replace('EDU', 'DP') : undefined,
          studyRight.accepted_selection_path?.educationPhase1GroupId,
          studyRight.accepted_selection_path?.educationPhase2GroupId
        ].filter(Boolean)
      )
    )

    const moduleCode = educationModuleGroupId ? moduleCodeByGroupId[educationModuleGroupId]?.code : undefined

    const elements = [
      {
        code: moduleCode,
        start_date: studyRight.valid?.startDate,
        end_date: studyRight.valid?.endDate,
        id: studyRight.id,
        selections: selections.map(programmeGroupId => {
          return {
            id: studyRight.id + '_' + programmeGroupId,
            code: moduleCodeByGroupId[programmeGroupId]?.code,
            moduleId: moduleCodeByGroupId[programmeGroupId]?.id,
            groupId: programmeGroupId,
            studyTrack: programmeStudytrackPairs[programmeGroupId]
              ? {
                  code: moduleCodeByGroupId[programmeStudytrackPairs[programmeGroupId]]?.code,
                  moduleId: moduleCodeByGroupId[programmeStudytrackPairs[programmeGroupId]]?.id,
                  groupId: programmeStudytrackPairs[programmeGroupId]
                }
              : null
          }
        })
      }
    ].filter(element => element.code)

    if (!elements.length) return acc

    if (!acc[studyRight.person_id]) acc[studyRight.person_id] = []
    acc[studyRight.person_id].push(...elements)
    return acc
  }, {})

  const personsWithStudyRights = personsWithStudyRightOrEmployeeNumber.map(person => ({
    ...person.toJSON(),
    studyRights: studyRightsByPersonId[person.id] || []
  }))

  res.send(personsWithStudyRights)
})

grapaRouter.get('/programs', async (req, res) => {
  const [educations] = await sequelize.query(`
    WITH edu AS (
      SELECT DISTINCT id, 
          ARRAY(SELECT DISTINCT value->>0 FROM jsonb_array_elements(jsonb_path_query_array(structure, '$.**.moduleGroupId'))) "group_ids",
          structure,
          education_type AS type, 
          id AS edu_id
      FROM educations AS tmp
      WHERE education_type = ANY (ARRAY['urn:code:education-type:degree-education:bachelors-degree', 'urn:code:education-type:degree-education:bachelors-and-masters-degree', 'urn:code:education-type:degree-education:masters-degree'])
      ),
      programs AS (
          SELECT 
              group_ids,
              structure,
              type,
              id,
              (
                  SELECT jsonb_agg(jsonb_build_object(
                      'group_id', value, 
                      'id', modules.id,
                      'type', modules.type,
                      'name', modules.name,
                      'code', modules.code,
                      'valid_from', modules.validity_period->>'startDate'
                  )) 
                  FROM unnest(edu.group_ids) AS value
                  LEFT JOIN modules ON value = modules.group_id
                  WHERE modules.type = ANY (ARRAY['DegreeProgramme', 'StudyModule'])
              ) "modules"
          FROM edu
    )

    SELECT * FROM programs;
    `)

  const programs = {}
  const modules = {}
  const now = new Date()
  const seenModules = new Set()

  // Get all modules from educations and store them by group_id
  educations.forEach(education => {
    if (education.modules) {
      education.modules.forEach(module => {
        const validity_start = new Date(module.valid_from)
        if (!seenModules.has(module.code) && validity_start <= now) {
          modules[module.group_id] = module
          seenModules.add(module.code)
        }
        if (
          seenModules.has(module.code) &&
          validity_start <= now &&
          new Date(modules[module.group_id]) < validity_start
        ) {
          modules[module.group_id] = module
        }
        // If the validity period has not started yet, and there is no other version of the programme that has started yet
        else if (!seenModules.has(module.code)) {
          modules[module.group_id] = module
        }
        // Otherwise skip
        else {
          return
        }
      })
    }
  })

  educations.forEach(education => {
    const phases = []
    if (education.structure.phase1) phases.push({ data: education.structure.phase1, type: 'phase1' })
    if (education.structure.phase2) phases.push({ data: education.structure.phase2, type: 'phase2' })

    phases.forEach(phase => {
      phase.data.options.forEach(option => {
        if (phase.data.options) {
          const programme_module = modules[option.moduleGroupId]

          if (programme_module) {
            // Only get "modern" programmes
            if (!programme_module.code || !programme_module.code.match(/(\d_)*[MK]H\d+/)) return

            const children = option.childOptions ? option.childOptions.map(child => child.moduleGroupId) : []

            let level = null
            // Getting the level (masters or bachelors) from the code
            if (programme_module.code.length >= 2 && programme_module.code[1] === 'H') {
              level = programme_module.code[0] === 'K' ? 'bachelor' : programme_module.code[0] === 'M' ? 'master' : null
            } else if (
              programme_module.code.length >= 3 &&
              programme_module.code.at(-3) === '-' &&
              programme_module.code.at(-1) === 'a'
            ) {
              level = programme_module.code.endsWith('-ba')
                ? 'bachelor'
                : programme_module.code.endsWith('-ma')
                  ? 'master'
                  : null
            }

            // Append only unseen programmes
            if (!programs[programme_module.code]) {
              programs[programme_module.code] = {
                ...programme_module,
                level,
                children: {}
              }
            }

            // Always append child modules
            children.forEach(child => {
              programs[programme_module.code].children[child] = modules[child]
            })
          }
        }
      })
    })
  })

  res.send(programs)
  return
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

grapaRouter.get('/modules', async (req, res) => {
  const { limit, offset, ids } = req.query
  if (!limit || !offset || !ids) return res.sendStatus(400)

  const modules = (
    await models.Module.findAll({
      where: {
        id: ids
      }
    })
  ).filter(p => !p.validityPeriod?.endDate)

  if (modules.length === 0) return res.send([])

  res.send(modules)
})

router.use('/', grapaRouter)

module.exports = router
