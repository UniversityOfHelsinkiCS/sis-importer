const { Model, ARRAY, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class AssessmentItem extends Model {}

AssessmentItem.init(
  {
    autoId: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: STRING,
      unique: true
    },
    modificationOrdinal: {
      type: BIGINT,
      unique: true
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
      type: ARRAY(JSONB)
    },
    primaryCourseUnitGroupId: {
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
    sequelize: sequelize,
    modelName: 'assessment_item',
    tableName: 'assessment_items',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modificationOrdinal']
      },
      {
        fields: ['id']
      }
    ]
  }
)

module.exports = AssessmentItem
