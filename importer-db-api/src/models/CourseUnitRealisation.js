const { Model, STRING, DATE, ARRAY, JSONB, Op } = require('sequelize')
const { sequelize } = require('../config/db')
const dateFns = require('date-fns')

class CourseUnitRealisation extends Model {}

const scopes = {
  assessmentItemIdsOverlap(ids) {
    return {
      where: {
        assessmentItemIds: {
          [Op.overlap]: ids,
        },
      },
    }
  },
  activityPeriodEndDateAfter(date) {
    return {
      where: {
        [Op.and]: [
          { activityPeriod: { endDate: { [Op.ne]: null } } },
          {
            activityPeriod: {
              endDate: {
                [Op.gt]: dateFns.format(new Date(date), 'yyyy-MM-dd'),
              },
            },
          },
        ],
      },
    }
  },
}

CourseUnitRealisation.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
    universityOrgIds: {
      type: ARRAY(STRING),
    },
    flowState: {
      type: STRING,
    },
    name: {
      type: JSONB,
    },
    nameSpecifier: {
      type: JSONB,
    },
    assessmentItemIds: {
      type: ARRAY(STRING),
    },
    activityPeriod: {
      type: JSONB,
    },
    teachingLanguageUrn: {
      type: STRING,
    },
    courseUnitRealisationTypeUrn: {
      type: STRING,
    },
    studyGroupSets: {
      type: ARRAY(JSONB),
    },
    organisations: {
      type: ARRAY(JSONB),
    },
    enrolmentPeriod: {
      type: JSONB,
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
    underscored: true,
    sequelize: sequelize,
    modelName: 'course_unit_realisation',
    tableName: 'course_unit_realisations',
    scopes,
  }
)

module.exports = CourseUnitRealisation
