const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.addColumn('persons', 'preferred_language_urn', STRING),
      queryInterface.addColumn('persons', 'secondary_email', STRING)
    ])
  },
  down: async () => {}
}
