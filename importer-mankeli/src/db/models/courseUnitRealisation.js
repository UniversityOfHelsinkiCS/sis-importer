const { Model, STRING, DATE, ARRAY, JSONB, Op } = require('sequelize')
const { connection } = require('../connection')

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
      type: JSONB
    },
    organisations: {
      type: JSONB
    },
    enrolmentPeriod: {
      type: JSONB
    },
    responsibilityInfos: {
      type: JSONB
    },
    customCodeUrns: {
      type: JSONB
    },
    documentState: {
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
    modelName: 'course_unit_realisation',
    tableName: 'course_unit_realisations',
    defaultScope: {
      where: {
        documentState: {
          [Op.notIn]: ['DELETED', 'DRAFT']
        }
      }
    }
  }
)

module.exports = CourseUnitRealisation
