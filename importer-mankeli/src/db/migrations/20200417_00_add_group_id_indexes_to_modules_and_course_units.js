module.exports = {
  up: async queryInterface => {
    await Promise.all([
      queryInterface.addIndex('modules', ['group_id']),
      queryInterface.addIndex('course_units', ['group_id'])
    ])
  },

  down: async queryInterface => {
    await Promise.all([
      queryInterface.removeIndex('modules', ['group_id']),
      queryInterface.removeIndex('course_units', ['group_id'])
    ])
  }
}
