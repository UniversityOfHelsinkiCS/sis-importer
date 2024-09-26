const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('persons', 'has_personal_identity_code', BOOLEAN)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('persons', 'has_personal_identity_code', BOOLEAN)
  }
}
