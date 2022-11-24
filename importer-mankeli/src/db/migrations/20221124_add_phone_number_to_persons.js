const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('persons', 'phone_number', STRING)
  },
  down: async () => {}
}
