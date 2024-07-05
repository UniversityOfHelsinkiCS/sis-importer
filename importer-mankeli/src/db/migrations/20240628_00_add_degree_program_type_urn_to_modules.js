const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('modules', 'degree_program_type_urn', STRING)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('modules', 'degree_program_type_urn', STRING)
  }
}
