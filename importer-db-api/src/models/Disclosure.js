const { Model, STRING, BOOLEAN } = require('sequelize')
const { sequelize } = require('../config/db')

class Disclosure extends Model {}

Disclosure.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
    personId: {
      type: STRING,
    },
    disclosureCategoryId: {
      type: STRING,
    },
    authorized: {
      type: BOOLEAN,
    },
    documentState: {
      type: STRING,
    },
  },
  {
    underscored: true,
    sequelize: sequelize,
    modelName: 'disclosures',
    tableName: 'disclosures',
    indexes: [
      {
        unique: true,
        fields: ['id'],
      },
      {
        fields: ['disclosureCategoryId'],
      },
    ],
  }
)

module.exports = Disclosure
