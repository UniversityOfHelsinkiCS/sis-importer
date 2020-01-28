const { ARRAY, STRING, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.addColumn('studyrights', 'study_right_transfer', JSONB),
      queryInterface.addColumn('studyrights', 'study_right_extensions', ARRAY(JSONB)),
      queryInterface.addColumn('studyrights', 'transfer_out_university_urn', STRING),
      queryInterface.addColumn('studyrights', 'requested_selection_path', JSONB),
      queryInterface.addColumn('studyrights', 'phase1_minor_selections', ARRAY(JSONB)),
      queryInterface.addColumn('studyrights', 'phase2_minor_selections', ARRAY(JSONB))
    ])
  },
  down: async () => {}
}
