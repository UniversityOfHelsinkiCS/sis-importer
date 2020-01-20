const { Model, STRING, DATE, ARRAY, JSONB, BOOLEAN, DOUBLE, INTEGER } = require('sequelize')
const { sequelize } = require('../connection')

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
    personStudentNumber: {
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
      type: ARRAY(JSONB)
    },
    organisations: {
      type: ARRAY(JSONB)
    },
    state: {
      type: STRING
    },
    misregistration: {
      type: BOOLEAN
    },
    misregistrationRationale: {
      type: STRING
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
    modelName: 'attainment',
    tableName: 'attainments'
  }
)

module.exports = Attainment
