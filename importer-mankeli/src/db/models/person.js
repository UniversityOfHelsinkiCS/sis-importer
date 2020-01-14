const { Model, STRING, DATE, ARRAY, BOOLEAN } = require('sequelize')
const { sequelize } = require('../connection')

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
    employeeNumber: {
      type: STRING
    },
    primaryEmail: {
      type: STRING
    },
    oppijaId: {
      type: STRING
    },
    genderUrn: {
      type: STRING
    },
    genderFi: {
      type: STRING
    },
    genderEn: {
      type: STRING
    },
    genderSv: {
      type: STRING
    },
    countryUrn: {
      type: STRING
    },
    countryFi: {
      type: STRING
    },
    countryEn: {
      type: STRING
    },
    countrySv: {
      type: STRING
    },
    citizenships: {
      type: ARRAY(STRING)
    },
    dead: {
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
    sequelize,
    modelName: 'person',
    tableName: 'persons'
  }
)

module.exports = Person
