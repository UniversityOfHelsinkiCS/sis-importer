const { Model, STRING, BOOLEAN } = require('sequelize')
const { connection } = require('../connection')

class Disclosure extends Model {}

Disclosure.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    personId: {
      type: STRING
    },
    disclosureCategoryId: {
      type: STRING
    },
    authorized: {
      type: BOOLEAN
    },
    documentState: {
      type: STRING
    }
  },
  {
    underscored: true,
    sequelize: connection.sequelize,
    modelName: 'disclosures',
    tableName: 'disclosures',
    indexes: [
      {
        unique: true,
        fields: ['id']
      },
      {
        fields: ['disclosure_category_id']
      }
    ]
  }
)

module.exports = Disclosure
