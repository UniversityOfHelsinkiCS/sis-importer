const { Model, STRING, DATE, JSONB } = require('sequelize')
const { connection } = require('../connection')

class GradeScale extends Model {}

GradeScale.init(
  {
    id: {
      primaryKey: true,
      type: STRING
    },
    grades: {
      type: JSONB
    },
    name: {
      type: JSONB
    },
    validityPeriod: {
      type: JSONB
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
    sequelize: connection.sequelize,
    modelName: 'grade_scale',
    tableName: 'grade_scales'
  }
)

module.exports = GradeScale
