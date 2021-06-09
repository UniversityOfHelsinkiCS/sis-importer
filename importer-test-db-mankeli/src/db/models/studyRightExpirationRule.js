const { Model, STRING, JSONB, DATE, BOOLEAN } = require('sequelize')
const { connection } = require('../connection')

class StudyRightExpirationRule extends Model {}

StudyRightExpirationRule.init(
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
    type: {
      type: STRING
    },
    urn: {
      type: STRING
    },
    isLeafNode: {
      type: BOOLEAN
    },
    parentUrn: {
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
    modelName: 'study_right_expiration_rule',
    tableName: 'study_right_expiration_rules'
  }
)

module.exports = StudyRightExpirationRule
