const { JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('study_events', 'events', JSONB)
  },
  down: async () => {}
}
