const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { sequelize } = require('../connection')

class TermRegistration extends Model {}

TermRegistration.init(
  {
    studyRightId: {
      primaryKey: true,
      type: STRING
    },
    studentId: {
      primaryKey: true,
      type: STRING
    },
    termRegistrations: {
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
    sequelize,
    modelName: 'term_registration',
    tableName: 'term_registrations'
  }
)

module.exports = TermRegistration
