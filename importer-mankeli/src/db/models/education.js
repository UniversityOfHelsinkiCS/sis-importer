const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { sequelize } = require('../connection')

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
      type: ARRAY(JSONB)
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
      type: ARRAY(JSONB)
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
    modelName: 'education',
    tableName: 'educations'
  }
)

module.exports = Education
