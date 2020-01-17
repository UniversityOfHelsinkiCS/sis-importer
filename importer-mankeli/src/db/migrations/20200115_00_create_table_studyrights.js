const { STRING, DATE, JSONB, BIGINT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('studyrights', {
        id: {
          type: STRING,
          primaryKey: true
        },
        person_id: {
          type: STRING
        },
        education_id: {
          type: STRING
        },
        modification_ordinal: {
          type: BIGINT
        },
        organisation_id: {
          type: STRING
        },
        state: {
          type: STRING
        },
        valid: {
          type: JSONB
        },
        document_state: {
          type: STRING
        },
        grant_date: {
          type: DATE
        },
        study_start_date: {
          type: DATE
        },
        transfer_out_date: {
          type: DATE
        },
        term_registrations: {
          type: JSONB
        },
        study_right_cancellation: {
          type: JSONB
        },
        study_right_graduation: {
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
