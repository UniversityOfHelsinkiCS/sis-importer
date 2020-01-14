const { ARRAY, STRING, DATE, BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('persons', {
        id: {
          type: STRING,
          primaryKey: true
        },
        student_number: {
          type: STRING
        },
        date_of_birth: {
          type: DATE
        },
        first_names: {
          type: STRING
        },
        last_name: {
          type: STRING
        },
        employee_number: {
          type: STRING
        },
        primary_email: {
          type: STRING
        },
        oppija_id: {
          type: STRING
        },
        gender_urn: {
          type: STRING
        },
        gender_fi: {
          type: STRING
        },
        gender_en: {
          type: STRING
        },
        gender_sv: {
          type: STRING
        },
        country_urn: {
          type: STRING
        },
        country_fi: {
          type: STRING
        },
        country_en: {
          type: STRING
        },
        country_sv: {
          type: STRING
        },
        citizenships: {
          type: ARRAY(STRING)
        },
        dead: {
          type: BOOLEAN
        },
        created_at: {
          type: DATE
        },
        updated_at: {
          type: DATE
        }
      })
    ])
  },
  down: async () => {}
}
