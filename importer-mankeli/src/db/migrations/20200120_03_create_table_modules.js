const { ARRAY, STRING, DATE, JSONB, BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('modules', {
        id: {
          type: STRING,
          primaryKey: true
        },
        university_org_ids: {
          type: ARRAY(STRING)
        },
        group_id: {
          type: STRING
        },
        module_content_approval_required: {
          type: BOOLEAN
        },
        code: {
          type: STRING
        },
        target_credits: {
          type: JSONB
        },
        curriculum_period_ids: {
          type: ARRAY(STRING)
        },
        approval_state: {
          type: STRING
        },
        validity_period: {
          type: JSONB
        },
        content_description: {
          type: JSONB
        },
        responsibility_infos: {
          type: ARRAY(JSONB)
        },
        organisations: {
          type: ARRAY(JSONB)
        },
        name: {
          type: JSONB
        },
        study_level: {
          type: STRING
        },
        possible_attainment_languages: {
          type: ARRAY(STRING)
        },
        study_fields: {
          type: ARRAY(STRING)
        },
        graded: {
          type: BOOLEAN
        },
        grade_scale_id: {
          type: STRING
        },
        study_right_selection_type: {
          type: STRING
        },
        minor_study_right_acceptance_type: {
          type: STRING
        },
        type: {
          type: STRING
        },
        rule: {
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
