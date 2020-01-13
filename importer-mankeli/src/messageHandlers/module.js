const { getStudyLevels } = require('../utils/urnApi')

const parseStudyLevel = (studyLevel, studyLevels) => {
  if (!studyLevel) return null
  const { name, urn } = studyLevels[studyLevel]
  return { name, urn }
}

const parseModule = (module, studyLevels) => {
  return {
    id: module.id,
    groupId: module.groupId,
    name: module.name,
    type: module.type,
    code: module.code,
    studyLevel: parseStudyLevel(module.studyLevel, studyLevels)
  }
}

module.exports = async ({ entities, executionHash }) => {
  const studyLevels = await getStudyLevels()
  entities.map(entity => parseModule(entity, studyLevels))

  return { executionHash }
}
