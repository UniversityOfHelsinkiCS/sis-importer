const { Model, ARRAY, STRING, DATE, BIGINT, JSONB, Op } = require('sequelize')
const { sequelize } = require('../config/db')

class AssessmentItem extends Model {}

const scopes = {
  typeIsTeachingParticipation: {
    where: {
      assessment_item_type: 'urn:code:assessment-item-type:teaching-participation'
    }
  },
  primaryCourseUnitGroupIdIn(ids) {
    return {
      where: {
        primary_course_unit_group_id: {
          [Op.in]: ids
        }
      }
    }
  }
}

AssessmentItem.init(
  {
    autoId: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: STRING
    },
    modificationOrdinal: {
      type: BIGINT
    },
    documentState: {
      type: STRING
    },
    name: {
      type: JSONB
    },
    nameSpecifier: {
      type: JSONB
    },
    credits: {
      type: JSONB
    },
    gradeScaleId: {
      type: STRING
    },
    possibleAttainmentLanguages: {
      type: ARRAY(STRING)
    },
    assessmentItemType: {
      type: STRING
    },
    organisations: {
      type: JSONB
    },
    primaryCourseUnitGroupId: {
      type: STRING
    },
    snapshotDateTime: {
      type: DATE
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
    modelName: 'assessment_item',
    tableName: 'assessment_items',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modification_ordinal']
      },
      {
        fields: ['id']
      }
    ],
    scopes
  }
)

module.exports = AssessmentItem
