const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class GradeScale extends Model {}

GradeScale.init(
  {
    id: {
      primaryKey: true,
      type: STRING
    },
    grades: {
      type: ARRAY(JSONB)
    },
    name: {
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
    sequelize: sequelize,
    modelName: 'grade_scale',
    tableName: 'grade_scales'
  }
)

module.exports = GradeScale
