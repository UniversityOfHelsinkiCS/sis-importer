const { GradeScale } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseGradeScale = gradeScale => {
  return {
    id: gradeScale.id,
    grades: gradeScale.grades,
    name: gradeScale.name,
    validityPeriod: gradeScale.validityPeriod
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(GradeScale, active.map(parseGradeScale), transaction)
  await bulkDelete(GradeScale, deleted, transaction)
}
