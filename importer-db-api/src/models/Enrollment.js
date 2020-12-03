const { Model, STRING, DATE, BIGINT } = require('sequelize')
const { sequelize } = require('../config/db')

class Enrolment extends Model {}

Enrolment.init(
  {
    auto_id: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: STRING,
      unique: true
    },
    modificationOrdinal: {
      type: BIGINT,
      unique: true
    },
    personId: {
      type: STRING
    },
    verifierPersonId: {
      type: STRING
    },
    studyRightId: {
      type: STRING
    },
    assessmentItemId: {
      type: STRING
    },
    courseUnitRealisationId: {
      type: STRING
    },
    courseUnitId: {
      type: STRING
    },
    enrolmentDateTime: {
      type: DATE
    },
    state: {
      type: STRING
    }
  },
  {
    underscored: true,
    sequelize: sequelize,
    modelName: 'enrolment',
    tableName: 'enrolments',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modificationOrdinal']
      },
      {
        fields: ['id']
      }
    ]
  }
)

module.exports = Enrolment
