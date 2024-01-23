module.exports = {
  up: async queryInterface => {
    await queryInterface.removeColumn('attainments', 'misregistration_rationale')
  },
  down: async () => {}
}
