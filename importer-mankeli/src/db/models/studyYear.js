const { Model, STRING, DATE, JSONB, INTEGER, ARRAY } = require('sequelize')
const { connection } = require('../connection')

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
      type: ARRAY(JSONB)
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
