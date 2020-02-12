const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class EducationType extends Model {}

EducationType.init(
  {
    id: {
      primaryKey: true,
      type: STRING
    },
    parentId: {
      type: STRING
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
    modelName: 'education_type',
    tableName: 'education_types'
  }
)

module.exports = EducationType
