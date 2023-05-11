const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('persons', 'personal_data_safety_non_disclosure', BOOLEAN)
  },
  down: async () => {}
}
