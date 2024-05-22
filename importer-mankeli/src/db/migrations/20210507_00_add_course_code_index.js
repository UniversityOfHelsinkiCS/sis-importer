module.exports = {
  up: async queryInterface => {
    await Promise.all([queryInterface.addIndex('course_units', ['code'])])
  },

  down: async queryInterface => {
    await Promise.all([queryInterface.removeIndex('course_units', ['code'])])
  }
}
