const { Op } = require('sequelize')
const express = require('express')
const models = require('../../models')

const { addMonths } = require('date-fns')
const { timeTillCourseStart, relevantAttributes } = require('./config')

const router = express.Router()

const curreRouter = express.Router()

const addCourseUnitsToRealisations = async courseUnitRealisations => {
  const assessmentItemIds = courseUnitRealisations.flatMap(c => c.assessmentItemIds)

  const assessmentItemsWithCrap = await models.AssessmentItem.findAll({
    attributes: relevantAttributes.assessmentItem,
    where: {
      id: {
        [Op.in]: assessmentItemIds
      }
    },
    include: [
      {
        model: models.CourseUnit,
        attributes: relevantAttributes.courseUnit,
        as: 'courseUnit',
        required: true
      }
    ]
  })

  const allOrganisationIds = assessmentItemsWithCrap.flatMap(assessmentItem =>
    assessmentItem.organisations.map(org => org.organisationId)
  )

  const allOrganisations = await models.Organisation.findAll({
    attributes: ['name', 'id', 'code'],
    where: {
      id: allOrganisationIds
    }
  })

  const assessmentItems = assessmentItemsWithCrap.filter(aItem =>
    aItem?.courseUnit.completionMethods.find(method => method.assessmentItemIds.includes(aItem.id))
  )

  const findOrgByAssessmentItem = assessmentItem =>
    assessmentItem.organisations.map(org =>
      allOrganisations.find(organisation => organisation.id === org.organisationId)
    )

  const realisationsWithCourseUnits = courseUnitRealisations.map(aRealisation => {
    const realisation = aRealisation.get({ plain: true })

    const courseUnits = assessmentItems
      .filter(assessmentItem => realisation.assessmentItemIds.includes(assessmentItem.id))
      .map(assessmentItem => {
        const courseUnit = assessmentItem.get({ plain: true }).courseUnit
        const organisations = findOrgByAssessmentItem(assessmentItem)
        delete courseUnit.completionMethods
        return { ...courseUnit, organisations }
      })

    return {
      ...realisation,
      courseUnits
    }
  })

  return realisationsWithCourseUnits
}

router.get('/courses', async (req, res) => {
  const ids = [
    'hy-opt-cur-2324-5835857d-1529-4c30-b15e-9be8446ac990',
    'hy-opt-cur-2324-a71f093f-cc3e-4ef9-be93-7c406faf5a7f',
    'hy-opt-cur-2324-aff14324-d59a-4f88-9ebe-d27a33c4426f',
    'hy-opt-cur-2324-b4122e42-aa4b-4e9e-aa7b-05353298208a',
    'hy-opt-cur-2324-af6e86a0-bc69-4b33-b1e0-b2907b05748a',
    'hy-opt-cur-2324-2c79ac90-e1e5-4443-9fae-8949ae930a4a',
    'hy-opt-cur-2324-7d2f2aa8-8ac4-4f87-801c-10433e486ae6',
    'hy-opt-cur-2324-1951f54c-0ae9-4a29-b5e8-321b30a285f8',
    'hy-opt-cur-2324-dba191fe-9981-47ca-8ef0-647c606f3e13',
    'hy-opt-cur-2324-0d2b1b35-8ef4-4706-af81-fa6f4baba13b',
    'hy-opt-cur-2324-958a841b-f094-491d-8a35-f942061a7196',
    'hy-opt-cur-2324-f98a5a2c-6c5b-46e2-ae93-e49713d8c538',
    'hy-opt-cur-2324-b4d6d21c-2fc4-41ad-bac3-dd9c6d15970f',
    'hy-opt-cur-2324-9fc9071b-3402-4639-aa6d-e4dc16037a87',
    'hy-opt-cur-2324-32a73d0b-9f13-4947-a22a-f048c82d4d38',
    'hy-opt-cur-2324-f135a7d9-4b6d-4e63-b7de-87f7c0c23966',
    'hy-opt-cur-2324-a9aa2ac6-33d7-4380-b46b-250b80008816',
    'hy-opt-cur-2324-92fab645-fee0-41be-a3fe-f9766a44dc41',
    'hy-opt-cur-2324-99ef57d8-eb96-4104-b6a1-e010d1a604ea',
    'hy-opt-cur-2324-aabfcd60-0a23-4197-9269-862c65c1e16e',
    'hy-opt-cur-2324-4f6851f9-d354-4565-a105-a43ecdfd3af4',
    'hy-opt-cur-2324-7e553aa4-172d-4311-b95a-99de1839d2ca',
    'hy-opt-cur-2324-166d9029-9c49-4285-9d3f-3bf2afbcd737',
    'hy-opt-cur-2324-0144da73-e248-4cf8-aee2-5a87f57767a9',
    'hy-opt-cur-2324-d3f1fbad-57c1-4c47-8699-66192cf56031',
    'hy-opt-cur-2324-af6e86a0-bc69-4b33-b1e0-b2907b05748a-1',
    'hy-opt-cur-2324-7a7d134f-7991-4cb7-b577-d4d76ac36c85',
    'hy-opt-cur-2324-6192e246-daa0-4f10-bbfa-6cc68451ead4',
    'hy-opt-cur-2324-59b0440f-16b1-414e-9bcb-24af4b885c50',
    'hy-opt-cur-2324-654b28bf-865a-4b16-905d-7fc5e1283bd6',
    'hy-opt-cur-2324-dd4f00f7-afb6-4db4-8df5-df161f95c159',
    'hy-opt-cur-2324-165d41cc-c273-4f27-b313-00a3c81608dc',
    'otm-986b2612-7f1b-41a4-ab37-11ba339e886b',
    'hy-opt-cur-2324-34244087-50ad-4b88-9882-5411a58768b1',
    'otm-85d05742-7c56-424d-8440-2a958d1072f5',
    'hy-opt-cur-2324-82d6769d-2d76-4a8e-b546-3f34921a45c0',
    'hy-opt-cur-2324-b575f6fc-cb4b-420b-afcf-f8043a95e4f2',
    'hy-opt-cur-2324-8adee02f-c317-4632-b4a9-b419ac861110',
    'hy-opt-cur-2324-20822c07-6327-41fe-b96a-ac44bd0fc30c',
    'hy-opt-cur-2324-b76db9b9-b7a4-4016-ada2-be40c6353221',
    'hy-opt-cur-2324-fde7a558-379b-46ce-ab38-afacb0ab6ebf',
    'hy-opt-cur-2324-7597177a-ceb3-443e-8a49-33806c57bd1e',
    'hy-opt-cur-2324-5e703d1b-1968-4cdf-8657-8d4f4f7ad73e',
    'hy-opt-cur-2324-68e69510-e5a5-4d39-9afa-7bf83c905986',
    'hy-opt-cur-2324-83822dd7-a8a3-41fc-ae08-85598a6562f0',
    'hy-opt-cur-2324-14596e23-aff4-42bb-8c8d-61194ea99960',
    'hy-opt-cur-2324-0f42576a-c993-4acd-90ee-ad17c7ae890b',
    'hy-opt-cur-2324-4ed9447d-bc70-4863-a072-f173451ba5dd',
    'hy-opt-cur-2324-e4b54bf5-3030-4808-a247-cc146a02f9a2',
    'hy-opt-cur-2324-58b1a668-1541-4303-9eb3-8403f825ce61',
    'hy-opt-cur-2324-0a0000aa-ffbf-4a2b-b5f6-175f6768b824',
    'hy-opt-cur-2324-b0fa78cb-62c3-4e01-85ee-b71dd6491715',
    'hy-opt-cur-2324-8cf12b14-3619-4a93-88d4-7da1d91ed160',
    'hy-opt-cur-2324-84a99e84-fe49-4353-86d9-c3f5fc8acc44',
    'hy-opt-cur-2324-3c6536f7-0956-47da-814f-a0066f0781f0',
    'otm-f8b36482-f6c4-45ab-84ca-dcc978191fd2',
    'otm-4dab3f07-4ba7-4ae1-a269-ee1e0817c66c',
    'otm-7b54ebcf-35ee-405a-8754-8fa7dcb520f9',
    'hy-opt-cur-2324-2248f2ce-00c9-434d-a5d4-1edc37a93729',
    'hy-opt-cur-2324-1df3e470-d138-4e45-be27-a34714a0bb94',
    'hy-opt-cur-2324-4d4f771f-29c2-45bf-bc15-6882aefb46ab',
    'otm-81c2c98f-2870-4075-befe-2cf6474b5d12'
  ]

  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const courseStartTreshold = addMonths(new Date(), timeTillCourseStart)

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    limit,
    offset,
    where: {
      [Op.and]: [
        {
          'activityPeriod.endDate': {
            [Op.gte]: new Date()
          }
        },
        {
          'activityPeriod.startDate': {
            [Op.lte]: courseStartTreshold
          }
        }
      ]
    }
  })

  const tmp = await models.CourseUnitRealisation.findAll({
    attributes: relevantAttributes.courseUnitRealisation,
    where: {
      id: {
        [Op.in]: ids
      }
    }
  })

  const tmpWithCourseUnits = await addCourseUnitsToRealisations(tmp)

  const courseUnitRealisationsWithCourseUnits = await addCourseUnitsToRealisations(courseUnitRealisations)

  res.send(courseUnitRealisationsWithCourseUnits.concat(Number(offset) === 0 ? tmpWithCourseUnits : []))
})

curreRouter.get('/enrolments-new', async (req, res) => {
  const { since: sinceRaw, limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const since = new Date(sinceRaw)

  if (!sinceRaw || since === 'Invalid Date') {
    return res.status(400).send({ message: 'Missing or invalid query parameter since' })
  }

  const enrolments = await models.Enrolment.findAll({
    limit,
    offset,
    where: {
      state: 'ENROLLED',
      enrolmentDateTime: {
        [Op.gte]: since
      }
    },
    attributes: relevantAttributes.enrolments,
    order: [['id', 'DESC']]
  })

  res.send(enrolments)
})

curreRouter.get('/persons', async (req, res) => {
  const { limit, offset } = req.query
  if (!limit || !offset) return res.sendStatus(400)

  const persons = await models.Person.findAll({
    attributes: relevantAttributes.persons,
    order: [['id', 'DESC']],
    limit,
    offset
  })

  res.send(persons)
})

router.use('/', curreRouter)

module.exports = router
