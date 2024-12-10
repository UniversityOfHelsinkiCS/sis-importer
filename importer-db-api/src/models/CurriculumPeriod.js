const { Model, STRING, DATE, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class CurriculumPeriod extends Model {}

CurriculumPeriod.init(
  {
    id: {
      primaryKey: true,
      type: STRING
    },
    universityOrgId: {
      type: STRING
    },
    name: {
      type: JSONB
    },
    activePeriod: {
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
    sequelize,
    modelName: 'curriculum_period',
    tableName: 'curriculum_periods'
  }
)

module.exports = CurriculumPeriod
