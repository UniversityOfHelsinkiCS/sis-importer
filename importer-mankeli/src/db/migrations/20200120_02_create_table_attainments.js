const { ARRAY, STRING, DATE, JSONB, BOOLEAN, INTEGER, DOUBLE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('attainments', {
        id: {
          type: STRING,
          primaryKey: true
        },
        person_id: {
          type: STRING
        },
        person_student_number: {
          type: STRING
        },
        verifier_person_id: {
          type: STRING
        },
        study_right_id: {
          type: STRING
        },
        attainment_date: {
          type: DATE
        },
        registration_date: {
          type: DATE
        },
        expiry_date: {
          type: DATE
        },
        attainment_language_urn: {
          type: STRING
        },
        acceptor_persons: {
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
        misregistration_rationale: {
          type: STRING
        },
        primary: {
          type: BOOLEAN
        },
        credits: {
          type: DOUBLE
        },
        study_weeks: {
          type: DOUBLE
        },
        grade_scale_id: {
          type: STRING
        },
        grade_id: {
          type: INTEGER
        },
        grade_average: {
          type: DOUBLE
        },
        additional_info: {
          type: JSONB
        },
        study_field_urn: {
          type: STRING
        },
        name: {
          type: JSONB
        },
        study_level_urn: {
          type: STRING
        },
        course_unit_type_urn: {
          type: STRING
        },
        code: {
          type: STRING
        },
        type: {
          type: STRING
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
