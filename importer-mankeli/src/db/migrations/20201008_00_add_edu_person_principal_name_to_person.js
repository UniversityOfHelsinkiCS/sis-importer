const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('persons', 'edu_person_principal_name', STRING)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('persons', 'edu_person_principal_name')
  }
}
