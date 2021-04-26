const { ARRAY, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('attainments', 'assessment_item_attainment_ids', ARRAY(STRING))
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('attainments', 'assessment_item_attainment_ids')
  }
}
