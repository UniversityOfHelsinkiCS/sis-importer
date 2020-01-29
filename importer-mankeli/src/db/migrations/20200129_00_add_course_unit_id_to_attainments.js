const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('attainments', 'course_unit_id', STRING)
    await queryInterface.addIndex('attainments', ['course_unit_id'])
  },
  down: async () => {}
}
