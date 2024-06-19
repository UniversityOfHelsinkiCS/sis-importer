const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('modules', 'degree_programme_type_urn', STRING)
  },
  down: async () => {}
}
