const { Model, ARRAY, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { connection } = require('../connection')

class AssessmentItem extends Model {}

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
    sequelize: connection.sequelize,
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
    ]
  }
)

module.exports = AssessmentItem
