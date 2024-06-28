const { Model, STRING, DATE, ARRAY, BOOLEAN, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')
const CourseUnit = require('./CourseUnit')

const customFlatten = arr => {
  const result = []

  for (const elem of arr) {
    if (!Array.isArray(elem) || elem.length === 0 || (!elem[0].module && elem[0].code)) {
      result.push(elem)
      continue
    }

    for (const subelem of elem) {
      result.push(subelem)
    }
  }

  return result
}

const creditResolver = async (rule, n) => {
  const data = await resolver(rule.rule, n + 1)
  return data
}

const moduleRuleResolver = async (mod, n) => {
  const result = await resolver(mod.rule, n + 1)
  return customFlatten(result)
}

const moduleResolver = async (rule, n) => {
  const id = rule.moduleGroupId

  const mod = (
    await Module.findAll({
      limit: 1,
      where: { group_id: id },
      order: [['curriculum_period_ids', 'DESC']]
    })
  )[0]

  if (!mod) {
    return { error: 'Could not find module' }
  }

  if (mod.type === 'StudyModule') {
    const result = await resolver(mod.rule, n)
    if (mod.code.slice(0, 3) === 'KK-') return null
    const moduleCourses = { id: mod.groupId, code: mod.code, name: mod.name, type: 'module', children: result }
    return moduleCourses
  }

  if (mod.type === 'GroupingModule') {
    const module = await moduleRuleResolver(mod, n)
    return customFlatten(module)
  }

  return {
    name: mod.name,
    type: 'unknown'
  }
}

const compositeResolver = async (rule, n) => {
  const result = await Promise.all(rule.rules.map(r => resolver(r, n + 1)))
  return customFlatten(result.filter(Boolean))
}

const courseResolver = async rule => {
  const id = rule.courseUnitGroupId
  const course = await CourseUnit.findOne({
    where: {
      group_id: id
    }
  })

  if (!course) {
    return { error: 'could not find course' }
  }

  return {
    id: course.groupId,
    courseUnitId: course.id,
    code: course.code,
    name: course.name,
    type: 'course'
  }
}

const resolver = async (rule, n) => {
  if (rule.type === 'CreditsRule') {
    return creditResolver(rule, n + 1)
  }
  if (rule.type === 'CompositeRule') {
    return compositeResolver(rule, n)
  }
  if (rule.type === 'ModuleRule') {
    return moduleResolver(rule, n)
  }
  if (rule.type === 'CourseUnitRule') {
    return courseResolver(rule)
  }

  if (rule.type === 'AnyCourseUnitRule') {
    return { id: rule.localId, name: 'Any course' }
  }

  if (rule.type === 'AnyModuleRule') {
    return { id: rule.localId, name: 'Any module' }
  }

  return {
    type: rule.type,
    fact: 'Unhandled rule'
  }
}

class Module extends Model {
  async getCourses() {
    const courses = {}

    const recursiveWrite = async module => {
      if (Array.isArray(module)) {
        module.forEach(recursiveWrite)
      }
      if (!module.id || !module.type) return
      const newModule = {
        id: module.id,
        code: module.code,
        name: module.name,
        type: module.type
      }

      if (module.type === 'course') courses[module.code] = newModule

      if (!module.children) return
      for (const child of module.children) {
        await recursiveWrite(child)
      }
    }

    const submodules = await resolver(this.rule)
    for (const submod of submodules) {
      recursiveWrite(submod, this.groupId)
    }

    return Object.values(courses).map(course => ({
      id: course.id,
      code: course.code,
      name: course.name
    }))
  }
}

Module.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    universityOrgIds: {
      type: ARRAY(STRING)
    },
    groupId: {
      type: STRING
    },
    moduleContentApprovalRequired: {
      type: BOOLEAN
    },
    code: {
      type: STRING
    },
    targetCredits: {
      type: JSONB
    },
    curriculumPeriodIds: {
      type: ARRAY(STRING)
    },
    approvalState: {
      type: STRING
    },
    validityPeriod: {
      type: JSONB
    },
    contentDescription: {
      type: JSONB
    },
    responsibilityInfos: {
      type: JSONB
    },
    organisations: {
      type: JSONB
    },
    name: {
      type: JSONB
    },
    studyLevel: {
      type: STRING
    },
    possibleAttainmentLanguages: {
      type: ARRAY(STRING)
    },
    studyFields: {
      type: ARRAY(STRING)
    },
    graded: {
      type: BOOLEAN
    },
    gradeScaleId: {
      type: STRING
    },
    studyRightSelectionType: {
      type: STRING
    },
    minorStudyRightAcceptanceType: {
      type: STRING
    },
    type: {
      type: STRING
    },
    rule: {
      type: JSONB
    },
    degreeTitleUrns: {
      type: ARRAY(STRING)
    },
    degreeProgramTypeUrn: {
      type: STRING
    },
    createdAt: {
      type: DATE
    },
    updatedAt: {
      type: DATE
    }
  },
  {
    underscored: true,
    sequelize,
    modelName: 'module',
    tableName: 'modules',
    indexes: [
      {
        fields: ['group_id']
      }
    ]
  }
)

module.exports = Module
