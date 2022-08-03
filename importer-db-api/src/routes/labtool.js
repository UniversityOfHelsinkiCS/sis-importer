const express = require('express')
const { Op } = require('sequelize')
const { isString } = require('lodash')
const dateFns = require('date-fns')
const { getYear, isValid, getMonth, getDate } = require('date-fns')

const models = require('../models')
const { NotFoundError, UserInputError } = require('../errors')

const router = express.Router()

router.get('/courses', async (req, res) => {
  const { year, term } = req.query

  if (!year) {
    throw new UserInputError('Year is required')
  }

  if (!term) {
    throw new UserInputError('Term is required')
  }

  const CODES = ['TKT20002', 'TKT20010', 'TKT20011']

  const useNameSpecifier = Number(year) > 2022 || (Number(year) === 2022 && term !== 'K')

  let courseUnitRealisations = []

  for (const code of CODES) {
    let newCourseUnitRealisations = await getCourseRealisationsByCode(code, `${year}-01-01`)

    newCourseUnitRealisations = newCourseUnitRealisations
      .filter(
        courseUnitRealisation =>
          getAcademicYear(courseUnitRealisation.activityPeriod.startDate) === year &&
          getTerm(courseUnitRealisation.activityPeriod.startDate) === term
      )
      .map(courseUnitRealisation => ({
        id: [
          code,
          getAcademicYear(courseUnitRealisation.activityPeriod.startDate),
          getTerm(courseUnitRealisation.activityPeriod.startDate),
          getCourseType(courseUnitRealisation.courseUnitRealisationTypeUrn),
        ].join('.'),
        name: useNameSpecifier ? courseUnitRealisation.nameSpecifier.fi : courseUnitRealisation.name.fi,
        starts: new Date(courseUnitRealisation.activityPeriod.startDate),
        ends: new Date(courseUnitRealisation.activityPeriod.endDate),
      }))
    newCourseUnitRealisations = addCourseNumbers(newCourseUnitRealisations).sort((a, b) => (a.id > b.id ? 1 : -1))
    courseUnitRealisations = courseUnitRealisations.concat(newCourseUnitRealisations)
  }

  res.send(courseUnitRealisations)
})

router.get('/courses/:id', async (req, res) => {
  const { id } = req.params
  const { code, term, year, type, number } = parseCourseId(id)

  let courseUnitRealisations = await getCourseRealisationsByCode(code, `${year}-01-01`)

  courseUnitRealisations = courseUnitRealisations.filter(
    courseUnitRealisation =>
      getAcademicYear(courseUnitRealisation.activityPeriod.startDate) === year &&
      getTerm(courseUnitRealisation.activityPeriod.startDate) === term &&
      getCourseType(courseUnitRealisation.courseUnitRealisationTypeUrn) === type
  )

  const courseUnitRealisation = courseUnitRealisations[courseUnitRealisations.length - number]

  if (!courseUnitRealisation) {
    throw new NotFoundError(`Course ${id} is not found`)
  }

  const personIds = courseUnitRealisation.responsibilityInfos.map(responsibilityInfo => responsibilityInfo.personId)

  const persons = await models.Person.findAll({
    attributes: ['eduPersonPrincipalName'],
    where: {
      id: {
        [Op.in]: personIds,
      },
    },
  })

  const teachers = persons.map(person => person.eduPersonPrincipalName.split('@')[0])

  res.send({ teachers })
})

const getCourseRealisationsByCode = async (code, activityPeriodEndDateAfter) => {
  const courseUnit = await models.CourseUnit.findOne({
    where: {
      code,
    },
  })

  if (!courseUnit) {
    throw new NotFoundError(`Course unit with code ${code} is not found`)
  }

  const { groupId } = courseUnit

  const assessmentItems = await models.AssessmentItem.findAll({
    where: {
      primary_course_unit_group_id: groupId,
      assessment_item_type: {
        [Op.in]: ['urn:code:assessment-item-type:exam', 'urn:code:assessment-item-type:teaching-participation'],
      },
    },
    attributes: ['id'],
    raw: true,
  })

  if (!assessmentItems) {
    return []
  }

  const courseUnitRealisations = await models.CourseUnitRealisation.findAll({
    where: {
      assessmentItemIds: {
        [Op.overlap]: assessmentItems.map(({ id }) => id),
      },
      ...(activityPeriodEndDateAfter && {
        [Op.and]: [
          { activityPeriod: { endDate: { [Op.ne]: null } } },
          {
            activityPeriod: {
              endDate: {
                [Op.gt]: dateFns.format(new Date(activityPeriodEndDateAfter), 'yyyy-MM-dd'),
              },
            },
          },
        ],
      }),
    },
  })

  return courseUnitRealisations
}

const getAcademicYear = dateLike => {
  const date = new Date(dateLike)

  if (!isValid(date)) {
    return undefined
  }

  return getYear(date).toString()
}

const getTerm = dateLike => {
  const date = new Date(dateLike)

  if (!isValid(date)) {
    return undefined
  }

  // Month index starts at 0
  const month = getMonth(date) + 1
  const dayOfMonth = getDate(date)

  if (month < 5) {
    return 'K'
  } else if (month > 8 || (month === 8 && dayOfMonth > 20)) {
    return 'S'
  }

  return 'V'
}

const getCourseType = courseUnitRealisationTypeUrn => {
  const typeByCourseUnitRealisationType = {
    'independent-work-essay': 'K',
    'exam-electronic': 'L',
    'exam-final': 'L',
    'teaching-participation-field-course': 'K',
    'teaching-participation-small-group': 'K',
    'independent-work-project': 'A',
    'teaching-participation-seminar': 'S',
    'thesis-doctoral': 'Y',
    'licentiate-thesis': 'Y',
    'independent-work-presentation': 'K',
    'training-training': 'K',
    'exam-exam': 'L',
    'teaching-participation-lab': 'A',
    'exam-midterm': 'L',
    'independent-work-learning-diary': 'K',
    'teaching-participation-lectures': 'K',
    'teaching-participation-online': 'K',
  }

  if (!courseUnitRealisationTypeUrn) {
    return undefined
  }

  const parts = courseUnitRealisationTypeUrn.split(':')
  const courseUnitRealisationType = parts[parts.length - 1]

  return typeByCourseUnitRealisationType[courseUnitRealisationType] || 'K'
}

const addCourseNumbers = courseUnitRealisations => {
  const courseIds = courseUnitRealisations.map(courseUnitRealisation => courseUnitRealisation.id)

  let count = {}
  for (const courseId of new Set(courseIds)) {
    const sameIds = courseIds.filter(id => id === courseId)
    count[courseId] = sameIds.length
  }

  courseUnitRealisations = courseUnitRealisations.map(courseUnitRealisation => {
    const { id } = courseUnitRealisation
    const courseUnitRealisationWithNumber = { ...courseUnitRealisation, id: `${id}.${count[id]}` }

    count[id] -= 1

    return courseUnitRealisationWithNumber
  })

  return courseUnitRealisations
}

const parseCourseId = id => {
  if (!isString(id)) {
    throw new UserInputError('Invalid course id')
  }

  const parts = id.split('.')
  const [code, year, term, type, number] = parts

  if (!code || !term || !year || !type || !number) {
    throw new UserInputError('Invalid course id')
  }

  const parsedYear = parseInt(year)
  const parsedNumber = parseInt(number)

  if (isNaN(parsedYear) || isNaN(parsedNumber)) {
    throw new UserInputError('Invalid course id')
  }

  return { code, term, year, type, number }
}

module.exports = router
