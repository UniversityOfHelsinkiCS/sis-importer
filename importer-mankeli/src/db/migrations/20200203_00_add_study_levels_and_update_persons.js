const { STRING, JSONB, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.removeColumn('persons', 'gender_fi'),
      queryInterface.removeColumn('persons', 'gender_en'),
      queryInterface.removeColumn('persons', 'gender_sv'),
      queryInterface.removeColumn('persons', 'country_fi'),
      queryInterface.removeColumn('persons', 'country_en'),
      queryInterface.removeColumn('persons', 'country_sv'),
      queryInterface.createTable('study_levels', {
        id: {
          primaryKey: true,
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
