const { ARRAY } = require('sequelize')
const { Model, STRING, DATE, JSONB, BOOLEAN, DOUBLE, INTEGER } = require('sequelize')
const { connection } = require('../connection')

class Attainment extends Model {}

Attainment.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    personId: {
      type: STRING
    },
    verifierPersonId: {
      type: STRING
    },
    studyRightId: {
      type: STRING
    },
    attainmentDate: {
      type: DATE
    },
    registrationDate: {
      type: DATE
    },
    expiryDate: {
      type: DATE
    },
    attainmentLanguageUrn: {
      type: STRING
    },
    acceptorPersons: {
      type: JSONB
    },
    organisations: {
      type: JSONB
    },
    state: {
      type: STRING
    },
    misregistration: {
      type: BOOLEAN
    },
    primary: {
      type: BOOLEAN
    },
    credits: {
      type: DOUBLE
    },
    studyWeeks: {
      type: DOUBLE
    },
    gradeScaleId: {
      type: STRING
    },
    gradeId: {
      type: INTEGER
    },
    gradeAverage: {
      type: DOUBLE
    },
    additionalInfo: {
      type: JSONB
    },
    studyFieldUrn: {
      type: STRING
    },
    name: {
      type: JSONB
    },
    studyLevelUrn: {
      type: STRING
    },
    courseUnitTypeUrn: {
      type: STRING
    },
    code: {
      type: STRING
    },
    type: {
      type: STRING
    },
    assessmentItemId: {
      type: STRING
    },
    courseUnitRealisationId: {
      type: STRING
    },
    courseUnitId: {
      type: STRING
    },
    moduleId: {
      type: STRING
    },
    moduleGroupId: {
      type: STRING
    },
    nodes: {
      type: JSONB
    },
    assessmentItemAttainmentIds: {
      type: ARRAY(STRING)
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
    modelName: 'attainment',
    tableName: 'attainments',
    indexes: [
      {
        fields: ['person_id']
      },
      {
        fields: ['course_unit_id']
      },
      {
        fields: ['course_unit_realisation_id']
      },
      {
        fields: ['assessment_item_id']
      },
      {
        fields: ['module_id']
      }
    ]
  }
)

module.exports = Attainment
