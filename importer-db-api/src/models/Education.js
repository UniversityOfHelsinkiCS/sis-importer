const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class Education extends Model {}

Education.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    groupId: {
      type: STRING
    },
    name: {
      type: JSONB
    },
    code: {
      type: STRING
    },
    educationType: {
      type: STRING
    },
    validityPeriod: {
      type: JSONB
    },
    organisations: {
      type: JSONB
    },
    universityOrgIds: {
      type: ARRAY(STRING)
    },
    attainmentLanguages: {
      type: ARRAY(STRING)
    },
    structure: {
      type: JSONB
    },
    studyFields: {
      type: ARRAY(STRING)
    },
    responsibilityInfos: {
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
    sequelize: sequelize,
    modelName: 'education',
    tableName: 'educations'
  }
)

module.exports = Education
