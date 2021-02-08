const { ARRAY, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('modules', 'degree_title_urns', ARRAY(STRING))
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('modules', 'degree_title_urns')
  }
}
