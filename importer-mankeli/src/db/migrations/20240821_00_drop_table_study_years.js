module.exports = {
  up: async queryInterface => {
    await queryInterface.dropTable('study_years')
  },
  down: async () => {}
}
