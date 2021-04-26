const { STRING, JSONB, DATE, BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('study_right_expiration_rules', {
        id: {
          type: STRING,
          primaryKey: true
        },
        name: {
          type: JSONB
        },
        short_name: {
          type: JSONB
        },
        type: {
          type: STRING
        },
        urn: {
          type: STRING
        },
        is_leaf_node: {
          type: BOOLEAN
        },
        parent_urn: {
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
