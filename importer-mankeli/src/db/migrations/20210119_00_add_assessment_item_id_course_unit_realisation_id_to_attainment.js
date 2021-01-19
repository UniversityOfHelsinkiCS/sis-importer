const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('attainments', 'assessment_item_id', STRING)
    await queryInterface.addColumn('attainments', 'course_unit_realisation_id', STRING)
    await queryInterface.addIndex('attainments', ['assessment_item_id'])
    await queryInterface.addIndex('attainments', ['course_unit_realisation_id'])
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('attainments', 'assessment_item_id')
    await queryInterface.removeColumn('attainments', 'course_unit_realisation_id')
  }
}
