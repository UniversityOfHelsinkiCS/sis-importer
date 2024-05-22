const { Model, STRING, DATE, JSONB, BOOLEAN } = require('sequelize')
const { sequelize } = require('../config/db')

class Plan extends Model {}

Plan.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    assessmentItemSelections: {
      type: JSONB
    },
    courseUnitSelections: {
      type: JSONB
    },
    curriculumPeriodId: {
      type: STRING
    },
    customCourseUnitAttainmentSelections: {
      type: JSONB
    },
    customModuleAttainmentSelections: {
      type: JSONB
    },
    learningOpportunityId: {
      type: STRING
    },
    moduleSelections: {
      type: JSONB
    },
    primary: {
      type: BOOLEAN
    },
    rootId: {
      type: STRING
    },
    userId: {
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
    sequelize: sequelize,
    modelName: 'plan',
    tableName: 'plans'
  }
)

module.exports = Plan
