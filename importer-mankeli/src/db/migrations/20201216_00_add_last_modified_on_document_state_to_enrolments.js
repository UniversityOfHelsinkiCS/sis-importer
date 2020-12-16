const { DATE, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('enrolments', 'last_modified_on', DATE)
    await queryInterface.addColumn('enrolments', 'document_state', STRING)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('enrolments', 'last_modified_on')
    await queryInterface.removeColumn('enrolments', 'document_state')
  }
}
