const { BOOLEAN, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('studyrights', 'phase1_education_classification_urn', STRING)
    await queryInterface.addColumn('studyrights', 'phase2_education_classification_urn', STRING)
    await queryInterface.addColumn('studyrights', 'phase1_education_classification_locked', BOOLEAN)
    await queryInterface.addColumn('studyrights', 'phase2_education_classification_locked', BOOLEAN)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('studyrights', 'phase1_education_classification_urn', STRING)
    await queryInterface.removeColumn('studyrights', 'phase2_education_classification_urn', STRING)
    await queryInterface.removeColumn('studyrights', 'phase1_education_classification_locked', BOOLEAN)
    await queryInterface.removeColumn('studyrights', 'phase2_education_classification_locked', BOOLEAN)
  }
}
