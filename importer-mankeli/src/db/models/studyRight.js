const { Model, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { sequelize } = require('../connection')

class StudyRight extends Model {}

StudyRight.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    personId: {
      type: STRING
    },
    state: {
      type: STRING
    },
    educationId: {
      type: STRING
    },
    organisationId: {
      type: STRING
    },
    modificationOrdinal: {
      type: BIGINT
    },
    documentState: {
      type: STRING
    },
    valid: {
      type: JSONB
    },
    grantDate: {
      type: DATE
    },
    studyStartDate: {
      type: DATE
    },
    transferOutDate: {
      type: DATE
    },
    termRegistrations: {
      type: JSONB
    },
    studyRightCancellation: {
      type: JSONB
    },
    studyRightGraduation: {
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
    modelName: 'studyright',
    tableName: 'studyrights'
  }
)

module.exports = StudyRight
