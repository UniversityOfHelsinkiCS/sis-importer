module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('attainments', ['module_id'])
  },
  down: async () => {}
}
