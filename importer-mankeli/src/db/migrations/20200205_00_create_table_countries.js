const { STRING, JSONB, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('countries', {
        id: {
          primaryKey: true,
          type: STRING
        },
        name: {
          type: JSONB
        },
        numeric: {
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
