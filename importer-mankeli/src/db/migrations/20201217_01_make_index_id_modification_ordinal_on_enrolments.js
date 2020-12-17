module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('enrolments', ['id', 'modification_ordinal'], { unique: true })
  },
  down: async queryInterface => {
    await queryInterface.removeIndex('enrolments', ['id', 'modification_ordinal'])
  }
}
