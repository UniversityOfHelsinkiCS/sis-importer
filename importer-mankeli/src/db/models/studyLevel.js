const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class StudyLevel extends Model {}

StudyLevel.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    name: {
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
    sequelize: connection.sequelize,
    modelName: 'study_level',
    tableName: 'study_levels'
  }
)

module.exports = StudyLevel
