const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class CourseUnitRealisation extends Model {}

CourseUnitRealisation.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    universityOrgIds: {
      type: ARRAY(STRING)
    },
    flowState: {
      type: STRING
    },
    name: {
      type: JSONB
    },
    nameSpecifier: {
      type: JSONB
    },
    assessmentItemIds: {
      type: ARRAY(STRING)
    },
    activityPeriod: {
      type: JSONB
    },
    teachingLanguageUrn: {
      type: STRING
    },
    courseUnitRealisationTypeUrn: {
      type: STRING
    },
    studyGroupSets: {
      type: ARRAY(JSONB)
    },
    organisations: {
      type: ARRAY(JSONB)
    },
    enrolmentPeriod: {
      type: JSONB
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
    sequelize: sequelize,
    modelName: 'course_unit_realisation',
    tableName: 'course_unit_realisations'
  }
)

module.exports = CourseUnitRealisation
