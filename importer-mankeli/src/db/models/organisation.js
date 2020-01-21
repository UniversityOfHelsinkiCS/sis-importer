const { Model, ARRAY, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { sequelize } = require('../connection')

class Organisation extends Model {}

Organisation.init(
  {
    autoId: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: STRING
    },
    modificationOrdinal: {
      type: BIGINT
    },
    documentState: {
      type: STRING
    },
    snapshotDateTime: {
      type: DATE
    },
    universityOrgId: {
      type: STRING
    },
    parentId: {
      type: STRING
    },
    predecessorIds: {
      type: ARRAY(STRING)
    },
    code: {
      type: STRING
    },
    name: {
      type: JSONB
    },
    abbreviation: {
      type: JSONB
    },
    status: {
      type: STRING
    },
    educationalInstitutionUrn: {
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
    sequelize,
    modelName: 'organisation',
    tableName: 'organisations',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modificationOrdinal']
      },
      {
        fields: ['id']
      }
    ]
  }
)

module.exports = Organisation
