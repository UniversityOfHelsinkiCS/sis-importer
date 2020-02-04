const { STRING, JSONB, DATE, INTEGER, ARRAY } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('study_years', {
        start_year: {
          primaryKey: true,
          type: INTEGER
        },
        name: {
          type: STRING
        },
        valid: {
          type: JSONB
        },
        org: {
          type: STRING
        },
        study_terms: {
          type: ARRAY(JSONB)
        },
        created_at: {
          type: DATE
        },
        updated_at: {
          type: DATE
        }
      }),
      queryInterface.addColumn('attainments', 'module_id', STRING),
      queryInterface.addColumn('attainments', 'module_group_id', STRING),
      queryInterface.addColumn('attainments', 'nodes', ARRAY(JSONB))
    ])

    await queryInterface.addIndex('study_years', ['org'])
  },
  down: async () => {}
}
