const { ARRAY } = require('sequelize')
const { INTEGER } = require('sequelize')
const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class Location extends Model {}

Location.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    universityOrgIds: {
      type: ARRAY(STRING)
    },
    name: {
      type: JSONB
    },
    capacity: {
      type: INTEGER,
    },
    buildingId: {
      type: STRING,
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
    modelName: 'location',
    tableName: 'locations'
  }
)

module.exports = Location
