const { ARRAY, STRING, DATE, JSONB, BIGINT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('organisations', {
      auto_id: {
        type: BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      id: {
        type: STRING
      },
      modification_ordinal: {
        type: BIGINT
      },
      document_state: {
        type: STRING
      },
      snapshot_date_time: {
        type: DATE
      },
      university_org_id: {
        type: STRING
      },
      parent_id: {
        type: STRING
      },
      predecessor_ids: {
        type: ARRAY(STRING)
      },
      code: {
        type: STRING
      },
      name: {
        type: JSONB
      },
      abbreviation: {
        type: JSONB
      },
      status: {
        type: STRING
      },
      educational_institution_urn: {
        type: STRING
      },
      created_at: {
        type: DATE
      },
      updated_at: {
        type: DATE
      }
    })

    await queryInterface.addIndex('organisations', ['id', 'modification_ordinal'], { unique: true })
    await queryInterface.addIndex('organisations', ['id'])
  },
  down: async () => {}
}
