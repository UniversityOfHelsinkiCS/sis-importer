const { ARRAY, STRING, DATE, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('course_unit_realisations', {
        id: {
          type: STRING,
          primaryKey: true
        },
        university_org_ids: {
          type: ARRAY(STRING)
        },
        flow_state: {
          type: STRING
        },
        name: {
          type: JSONB
        },
        name_specifier: {
          type: JSONB
        },
        assessment_item_ids: {
          type: ARRAY(STRING)
        },
        activity_period: {
          type: JSONB
        },
        teaching_language_urn: {
          type: STRING
        },
        course_unit_realisation_type_urn: {
          type: STRING
        },
        study_group_sets: {
          type: ARRAY(JSONB)
        },
        organisations: {
          type: ARRAY(JSONB)
        },
        enrolment_period: {
          type: JSONB
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
