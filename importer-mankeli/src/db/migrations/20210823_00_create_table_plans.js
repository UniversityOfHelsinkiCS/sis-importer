const { JSONB, STRING, DATE, BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('plans', {
        id: {
          type: STRING,
          primaryKey: true
        },
        assessment_item_selections: {
          type: JSONB
        },
        course_unit_selections: {
          type: JSONB
        },
        curriculum_period_id: {
          type: STRING
        },
        custom_course_unit_attainment_selections: {
          type: JSONB
        },
        custom_module_attainment_selections: {
          type: JSONB
        },
        learning_opportunity_id: {
          type: STRING
        },
        module_selections: {
          type: JSONB
        },
        primary: {
          type: BOOLEAN
        },
        root_id: {
          type: STRING
        },
        user_id: {
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
