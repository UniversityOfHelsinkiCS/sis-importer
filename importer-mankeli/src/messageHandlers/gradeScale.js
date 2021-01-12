const { GradeScale } = require('../db/models')
const { bulkCreate } = require('../utils/db')

const parseGradeScale = gradeScale => {
  return {
    id: gradeScale.id,
    grades: gradeScale.grades,
    name: gradeScale.name
  }
}

module.exports = async ({ entities }, transaction) => {
  await bulkCreate(GradeScale, entities.map(parseGradeScale), transaction)
}
