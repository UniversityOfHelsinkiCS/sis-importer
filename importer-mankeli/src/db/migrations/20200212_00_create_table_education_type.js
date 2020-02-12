const { STRING, JSONB, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('education_types', {
        id: {
          primaryKey: true,
          type: STRING
        },
        parent_id: {
          type: STRING
        },
        name: {
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
