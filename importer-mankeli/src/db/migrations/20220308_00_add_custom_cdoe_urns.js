const { JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([queryInterface.addColumn('course_unit_realisations', 'custom_code_urns', JSONB)])
  },
  down: async () => {}
}
