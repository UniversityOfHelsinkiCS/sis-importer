const { JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('studyrights', 'accepted_selection_path', JSONB)
  },
  down: async () => {}
}
