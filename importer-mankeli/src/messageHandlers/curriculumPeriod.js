const { CurriculumPeriod } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseCurriculumPeriod = curriculumPeriod => {
  return {
    id: curriculumPeriod.id,
    universityOrgId: curriculumPeriod.universityOrgId,
    name: curriculumPeriod.name,
    activePeriod: curriculumPeriod.activePeriod
  }
}

module.exports = async ({ active }, transaction) => {
  const parsedCurriculumPeriods = active.map(parseCurriculumPeriod)
  await bulkCreate(CurriculumPeriod, parsedCurriculumPeriods, transaction)
}
