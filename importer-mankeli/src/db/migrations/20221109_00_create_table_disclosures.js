const { STRING, BOOLEAN, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.createTable('disclosures', {
        id: {
          type: STRING,
          primaryKey: true
        },
        person_id: {
          type: STRING
        },
        disclosure_category_id: {
          type: STRING
        },
        authorized: {
          type: BOOLEAN
        },
        document_state: {
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
