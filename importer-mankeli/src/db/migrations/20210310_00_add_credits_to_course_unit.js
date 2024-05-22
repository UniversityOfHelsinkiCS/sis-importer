const { JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('course_units', 'credits', JSONB)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('course_units', 'credits')
  }
}
