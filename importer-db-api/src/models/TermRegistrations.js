const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class TermRegistration extends Model {}

TermRegistration.init(
  {
    studyRightId: {
      primaryKey: true,
      type: STRING,
    },
    studentId: {
      primaryKey: true,
      type: STRING,
    },
    termRegistrations: {
      type: JSONB,
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
  },
  {
    underscored: true,
    sequelize: sequelize,
    modelName: 'term_registration',
    tableName: 'term_registrations',
  }
)

module.exports = TermRegistration
