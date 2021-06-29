const { Model, STRING, DATE, ARRAY, JSONB, BOOLEAN, DOUBLE, INTEGER } = require('sequelize')
const { sequelize } = require('../config/db')

class Attainment extends Model {}

Attainment.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
    personId: {
      type: STRING,
    },
    verifierPersonId: {
      type: STRING,
    },
    studyRightId: {
      type: STRING,
    },
    attainmentDate: {
      type: DATE,
    },
    registrationDate: {
      type: DATE,
    },
    expiryDate: {
      type: DATE,
    },
    attainmentLanguageUrn: {
      type: STRING,
    },
    acceptorPersons: {
      type: JSONB,
    },
    organisations: {
      type: JSONB,
    },
    state: {
      type: STRING,
    },
    misregistration: {
      type: BOOLEAN,
    },
    misregistrationRationale: {
      type: STRING,
    },
    primary: {
      type: BOOLEAN,
    },
    credits: {
      type: DOUBLE,
    },
    studyWeeks: {
      type: DOUBLE,
    },
    gradeScaleId: {
      type: STRING,
    },
    gradeId: {
      type: INTEGER,
    },
    gradeAverage: {
      type: DOUBLE,
    },
    additionalInfo: {
      type: JSONB,
    },
    studyFieldUrn: {
      type: STRING,
    },
    name: {
      type: JSONB,
    },
    studyLevelUrn: {
      type: STRING,
    },
    courseUnitTypeUrn: {
      type: STRING,
    },
    code: {
      type: STRING,
    },
    type: {
      type: STRING,
    },
    courseUnitId: {
      type: STRING,
    },
    moduleId: {
      type: STRING,
    },
    moduleGroupId: {
      type: STRING,
    },
    nodes: {
      type: JSONB,
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
    courseUnitRealisationId: {
      type: STRING,
    },
    assessmentItemAttainmentIds: {
      type: ARRAY(STRING),
    },
    assessmentItemId: {
      type: STRING,
    },
  },
  {
    underscored: true,
    sequelize: sequelize,
    modelName: 'attainment',
    tableName: 'attainments',
    indexes: [
      {
        fields: ['person_id'],
      },
      {
        fields: ['course_unit_id'],
      },
      {
        fields: ['module_id'],
      },
    ],
  }
)

module.exports = Attainment
