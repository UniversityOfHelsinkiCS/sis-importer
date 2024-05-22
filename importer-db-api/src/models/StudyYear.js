const { Model, STRING, DATE, JSONB, INTEGER } = require('sequelize')
const { sequelize } = require('../config/db')

class StudyYear extends Model {}

StudyYear.init(
  {
    startYear: {
      primaryKey: true,
      type: INTEGER
    },
    name: {
      type: STRING
    },
    valid: {
      type: JSONB
    },
    org: {
      type: STRING
    },
    studyTerms: {
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
    modelName: 'study_year',
    tableName: 'study_years',
    indexes: [
      {
        fields: ['org']
      }
    ]
  }
)

module.exports = StudyYear
