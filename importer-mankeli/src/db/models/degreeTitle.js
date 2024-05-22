const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class DegreeTitle extends Model {}

DegreeTitle.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    name: {
      type: JSONB
    },
    shortName: {
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
    modelName: 'degree_title',
    tableName: 'degree_titles'
  }
)

module.exports = DegreeTitle
