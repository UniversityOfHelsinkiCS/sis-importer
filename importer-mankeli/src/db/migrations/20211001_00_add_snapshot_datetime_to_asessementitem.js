const { DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.addColumn('assessment_items', 'snapshot_date_time', DATE),
    ])
  },
  down: async () => {}
}
