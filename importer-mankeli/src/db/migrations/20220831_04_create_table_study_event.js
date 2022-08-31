const { STRING, JSONB, DATE, ARRAY } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('study_events', {
        id: {
          type: STRING,
          primaryKey: true
        },
        university_org_ids: {
          type: ARRAY(STRING),
        },
        primary_course_unit_realisation_id: {
          type: STRING,
        },
        name: {
          type: JSONB
        },
        location_ids: {
          type: ARRAY(STRING)
        },
        recurs_every: {
          type: STRING,
        },
        start_time: {
          type: DATE,
        },
        duration: {
          type: STRING,
        },
        recurs_until: {
          type: DATE,
        },
        exceptions: {
          type: ARRAY(DATE),
        },
        cancellations: {
          type: ARRAY(DATE),
        },
        overrides: {
          type: JSONB,
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
