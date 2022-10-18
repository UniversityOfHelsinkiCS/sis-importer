const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('persons', 'call_name', STRING)
  },
  down: async () => {}
}
