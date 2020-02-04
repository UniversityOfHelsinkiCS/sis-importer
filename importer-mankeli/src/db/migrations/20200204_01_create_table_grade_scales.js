const { STRING, JSONB, DATE, ARRAY } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('grade_scales', {
        id: {
          primaryKey: true,
          type: STRING
        },
        grades: {
          type: ARRAY(JSONB)
        },
        name: {
          type: JSONB
        },
        validity_period: {
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
