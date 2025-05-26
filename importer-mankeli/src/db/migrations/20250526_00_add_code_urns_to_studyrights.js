const { ARRAY, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('studyrights', 'code_urns', ARRAY(STRING))
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('studyrights', 'code_urns', ARRAY(STRING))
  }
}
