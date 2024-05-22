const { ARRAY, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('studyrights', 'study_right_expiration_rules_urn', ARRAY(STRING))
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('studyrights', 'study_right_expiration_rules_urn', ARRAY(STRING))
  }
}
