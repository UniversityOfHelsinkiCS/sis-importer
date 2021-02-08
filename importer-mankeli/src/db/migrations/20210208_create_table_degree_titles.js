const { STRING, JSONB, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('degree_titles', {
        id: {
          primaryKey: true,
          type: STRING
        },
        name: {
          type: JSONB
        },
        short_name: {
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
