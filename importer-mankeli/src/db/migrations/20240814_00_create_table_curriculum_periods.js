const { STRING, DATE, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('curriculum_periods', {
      id: {
        type: STRING,
        primaryKey: true
      },
      university_org_id: {
        type: STRING
      },
      name: {
        type: JSONB
      },
      active_period: {
        type: JSONB
      },
      created_at: {
        type: DATE
      },
      updated_at: {
        type: DATE
      }
    })
  },
  down: async queryInterface => {
    await queryInterface.dropTable('curriculum_periods')
  }
}
