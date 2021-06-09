const { Model, ARRAY, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { connection } = require('../connection')

class Organisation extends Model {}

Organisation.init(
  {
    autoId: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: STRING,
      unique: true
    },
    modificationOrdinal: {
      type: BIGINT,
      unique: true
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
    sequelize: connection.sequelize,
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
