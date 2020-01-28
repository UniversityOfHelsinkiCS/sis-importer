module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.addIndex('studyrights', ['person_id']),
      queryInterface.addIndex('attainments', ['person_id'])
    ])
  },
  down: async () => {}
}
