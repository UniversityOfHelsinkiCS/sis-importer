const { ARRAY } = require('sequelize')
const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class StudyEvent extends Model {}

StudyEvent.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    universityOrgIds: {
      type: ARRAY(STRING)
    },
    primaryCourseUnitRealisationId: {
      type: STRING
    },
    name: {
      type: JSONB
    },
    locationIds: {
      type: ARRAY(STRING)
    },
    recursEvery: {
      type: STRING
    },
    startTime: {
      type: DATE
    },
    duration: {
      type: STRING
    },
    recursUntil: {
      type: DATE
    },
    exceptions: {
      type: ARRAY(DATE)
    },
    cancellations: {
      type: ARRAY(DATE)
    },
    overrides: {
      type: JSONB
    },
    events: {
      type: JSONB,
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
    modelName: 'study_event',
    tableName: 'study_events'
  }
)

module.exports = StudyEvent
