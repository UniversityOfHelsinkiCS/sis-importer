const { Model, STRING, DATE, JSONB } = require('sequelize')
const { connection } = require('../connection')

class PersonGroup extends Model {}

PersonGroup.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    name: {
      type: JSONB
    },
    responsibilityInfos: {
      type: JSONB
    },
    type: {
      type: STRING
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
    modelName: 'person_group',
    tableName: 'person_groups'
  }
)

module.exports = PersonGroup
