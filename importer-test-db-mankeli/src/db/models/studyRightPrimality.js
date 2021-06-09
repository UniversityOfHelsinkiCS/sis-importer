const { Model, STRING, DATE } = require('sequelize')
const { connection } = require('../connection')

class StudyRightPrimality extends Model {}

StudyRightPrimality.init(
  {
    studyRightId: {
      primaryKey: true,
      type: STRING
    },
    studentId: {
      primaryKey: true,
      type: STRING
    },
    startDate: {
      primaryKey: true,
      type: DATE
    },
    endDate: {
      type: DATE
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
    modelName: 'study_right_primality',
    tableName: 'study_right_primalities'
  }
)

module.exports = StudyRightPrimality
