const { STRING, JSONB, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('admission_types', {
        id: {
          type: STRING,
          primaryKey: true
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
