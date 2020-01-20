const { ARRAY, STRING, DATE, JSONB, BIGINT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('assessment_items', {
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
      name: {
        type: JSONB
      },
      name_specifier: {
        type: JSONB
      },
      credits: {
        type: JSONB
      },
      grade_scale_id: {
        type: STRING
      },
      possible_attainment_languages: {
        type: ARRAY(STRING)
      },
      assessment_item_type: {
        type: STRING
      },
      organisations: {
        type: ARRAY(JSONB)
      },
      primary_course_unit_group_id: {
        type: STRING
      },
      created_at: {
        type: DATE
      },
      updated_at: {
        type: DATE
      }
    })

    await queryInterface.addIndex('assessment_items', ['id', 'modification_ordinal'], { unique: true })
    await queryInterface.addIndex('assessment_items', ['id'])
  },
  down: async () => {}
}
