const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('studyrights', 'admission_type_urn', STRING)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('studyrights', 'admission_type_urn', STRING)
  }
}
