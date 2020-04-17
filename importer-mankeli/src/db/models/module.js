const { Model, STRING, DATE, ARRAY, BOOLEAN, JSONB } = require('sequelize')
const { connection } = require('../connection')

class Module extends Model {}

Module.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    universityOrgIds: {
      type: ARRAY(STRING)
    },
    groupId: {
      type: STRING
    },
    moduleContentApprovalRequired: {
      type: BOOLEAN
    },
    code: {
      type: STRING
    },
    targetCredits: {
      type: JSONB
    },
    curriculumPeriodIds: {
      type: ARRAY(STRING)
    },
    approvalState: {
      type: STRING
    },
    validityPeriod: {
      type: JSONB
    },
    contentDescription: {
      type: JSONB
    },
    responsibilityInfos: {
      type: ARRAY(JSONB)
    },
    organisations: {
      type: ARRAY(JSONB)
    },
    name: {
      type: JSONB
    },
    studyLevel: {
      type: STRING
    },
    possibleAttainmentLanguages: {
      type: ARRAY(STRING)
    },
    studyFields: {
      type: ARRAY(STRING)
    },
    graded: {
      type: BOOLEAN
    },
    gradeScaleId: {
      type: STRING
    },
    studyRightSelectionType: {
      type: STRING
    },
    minorStudyRightAcceptanceType: {
      type: STRING
    },
    type: {
      type: STRING
    },
    rule: {
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
    modelName: 'module',
    tableName: 'modules',
    indexes: [
      {
        fields: ['group_id']
      }
    ],
  },
)

module.exports = Module
