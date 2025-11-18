const { Model, STRING, DATE, ARRAY, JSONB, Op } = require('sequelize')
const { sequelize } = require('../config/db')
const dateFns = require('date-fns')

class CourseUnitRealisation extends Model {}

const getActivityPeriodComparisonWhere = (column, operator, date) => {
  return {
    [Op.and]: [
      { activityPeriod: { [column]: { [Op.ne]: null } } },
      {
        activityPeriod: {
          [column]: {
            [operator]: dateFns.format(new Date(date), 'yyyy-MM-dd')
          }
        }
      },
      { documentState: 'ACTIVE' }
    ]
  }
}

const scopes = {
  assessmentItemIdsOverlap(ids) {
    return {
      where: {
        assessmentItemIds: {
          [Op.overlap]: ids
        },
        documentState: 'ACTIVE'
      }
    }
  },
  activityPeriodEndDateAfter(date) {
    return {
      where: getActivityPeriodComparisonWhere('endDate', Op.gt, date)
    }
  },
  activityPeriodEndDateBefore(date) {
    return {
      where: getActivityPeriodComparisonWhere('endDate', Op.lt, date)
    }
  },
  activityPeriodStartDateAfter(date) {
    return {
      where: getActivityPeriodComparisonWhere('startDate', Op.gt, date)
    }
  },
  activityPeriodStartDateBefore(date) {
    return {
      where: getActivityPeriodComparisonWhere('startDate', Op.lt, date)
    }
  }
}

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
    sequelize,
    modelName: 'course_unit_realisation',
    tableName: 'course_unit_realisations',
    scopes,
    defaultScope: {
      where: {
        documentState: 'ACTIVE'
      }
    }
  }
)

module.exports = CourseUnitRealisation
