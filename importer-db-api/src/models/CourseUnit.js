const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class CourseUnit extends Model {}

CourseUnit.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
    groupId: {
      type: STRING,
    },
    code: {
      type: STRING,
    },
    name: {
      type: JSONB,
    },
    validityPeriod: {
      type: JSONB,
    },
    gradeScaleId: {
      type: STRING,
    },
    studyLevel: {
      type: STRING,
    },
    courseUnitType: {
      type: STRING,
    },
    possibleAttainmentLanguages: {
      type: ARRAY(STRING),
    },
    assessmentItemOrder: {
      type: ARRAY(STRING),
    },
    organisations: {
      type: ARRAY(JSONB),
    },
    universityOrgIds: {
      type: ARRAY(STRING),
    },
    studyFields: {
      type: ARRAY(STRING),
    },
    substitutions: {
      type: ARRAY(JSONB),
    },
    completionMethods: {
      type: ARRAY(JSONB),
    },
    responsibilityInfos: {
      type: ARRAY(JSONB),
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
  },
  {
    indexes: [
      {
        fields: ['group_id'],
      },
    ],
    underscored: true,
    sequelize,
    modelName: 'course_unit',
    tableName: 'course_units',
  }
)

module.exports = CourseUnit
