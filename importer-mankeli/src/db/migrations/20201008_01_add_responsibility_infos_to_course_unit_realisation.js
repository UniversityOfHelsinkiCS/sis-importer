const { ARRAY, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('course_unit_realisations', 'responsibility_infos', ARRAY(JSONB))
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('course_unit_realisations', 'responsibility_infos')
  }
}
