const { JSONB, STRING, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('person_groups', {
        id: {
          type: STRING,
          primaryKey: true
        },
        name: {
          type: JSONB
        },
        responsibility_infos: {
          type: JSONB
        },
        type: {
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
