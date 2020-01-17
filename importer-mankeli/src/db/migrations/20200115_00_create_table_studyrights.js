const { ARRAY, STRING, DATE, JSONB, BIGINT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('studyrights', {
      auto_id: {
        type: BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      id: {
        type: STRING
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
        type: ARRAY(JSONB)
      },
      study_right_cancellation: {
        type: JSONB
      },
      study_right_graduation: {
        type: JSONB
      },
      snapshot_date_time: {
        type: DATE
      },
      created_at: {
        type: DATE
      },
      updated_at: {
        type: DATE
      }
    })

    await queryInterface.addIndex('studyrights', ['id', 'modification_ordinal'], { unique: true })
    await queryInterface.addIndex('studyrights', ['id'])
  },
  down: async () => {}
}
