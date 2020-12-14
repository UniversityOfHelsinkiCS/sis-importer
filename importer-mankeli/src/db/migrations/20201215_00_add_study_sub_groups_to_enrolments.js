const { ARRAY, JSONB, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('enrolments', 'study_sub_groups', ARRAY(JSONB))
    await queryInterface.addColumn('enrolments', 'confirmed_study_sub_group_ids', ARRAY(STRING))
    await queryInterface.addColumn('enrolments', 'tentative_study_sub_group_ids', ARRAY(STRING))
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('enrolments', 'study_sub_groups')
    await queryInterface.removeColumn('enrolments', 'confirmed_study_sub_group_ids')
    await queryInterface.removeColumn('enrolments', 'tentative_study_sub_group_ids')
  }
}
