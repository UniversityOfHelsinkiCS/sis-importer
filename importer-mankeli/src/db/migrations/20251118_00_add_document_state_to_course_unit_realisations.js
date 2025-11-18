const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('course_unit_realisations', 'document_state', STRING)
  },
  down: async () => {}
}
