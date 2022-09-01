const { STRING, JSONB, DATE, ARRAY, INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('locations', {
        id: {
          type: STRING,
          primaryKey: true
        },
        university_org_ids: {
          type: ARRAY(STRING)
        },
        name: {
          type: JSONB
        },
        capacity: {
          type: INTEGER,
        },
        building_id: {
          type: STRING,
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
