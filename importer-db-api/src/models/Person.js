const { Model, STRING, DATE, ARRAY, BOOLEAN } = require('sequelize')
const { sequelize } = require('../config/db')

class Person extends Model {}

Person.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    studentNumber: {
      type: STRING
    },
    dateOfBirth: {
      type: DATE
    },
    firstNames: {
      type: STRING
    },
    lastName: {
      type: STRING
    },
    callName: {
      type: STRING
    },
    eduPersonPrincipalName: {
      type: String
    },
    employeeNumber: {
      type: STRING
    },
    primaryEmail: {
      type: STRING
    },
    phoneNumber: {
      type: STRING
    },
    oppijaId: {
      type: STRING
    },
    genderUrn: {
      type: STRING
    },
    countryUrn: {
      type: STRING
    },
    citizenships: {
      type: ARRAY(STRING)
    },
    dead: {
      type: BOOLEAN
    },
    preferredLanguageUrn: {
      type: STRING
    },
    secondaryEmail: {
      type: STRING
    },
    personalDataSafetyNonDisclosure: {
      type: BOOLEAN
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
    modelName: 'person',
    tableName: 'persons'
  }
)

module.exports = Person
