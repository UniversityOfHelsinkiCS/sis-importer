const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class Country extends Model {}

Country.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    name: {
      type: JSONB
    },
    numeric: {
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
    modelName: 'country',
    tableName: 'countries'
  }
)

module.exports = Country
