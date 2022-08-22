module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.addIndex('enrolments', ['person_id']),
      queryInterface.addIndex('enrolments', ['course_unit_id']),
      queryInterface.addIndex('enrolments', ['course_unit_realisation_id'])
    ])
  },
  down: async () => {}
}
