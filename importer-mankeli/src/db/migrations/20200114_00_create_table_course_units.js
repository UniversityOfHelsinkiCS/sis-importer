const { ARRAY, STRING, DATE, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('course_units', {
        id: {
          type: STRING,
          primaryKey: true
        },
        group_id: {
          type: STRING
        },
        code: {
          type: STRING
        },
        name: {
          type: JSONB
        },
        validity_period: {
          type: JSONB
        },
        grade_scale_id: {
          type: STRING
        },
        study_level: {
          type: STRING
        },
        course_unit_type: {
          type: STRING
        },
        possible_attainment_languages: {
          type: ARRAY(STRING)
        },
        assessment_item_order: {
          type: ARRAY(STRING)
        },
        organisations: {
          type: ARRAY(JSONB)
        },
        substitutions: {
          type: ARRAY(JSONB)
        },
        completion_methods: {
          type: ARRAY(JSONB)
        },
        responsibility_infos: {
          type: ARRAY(JSONB)
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
