module.exports = {
  up: async queryInterface => {
    await queryInterface.removeColumn('attainments', 'person_student_number')
  },
  down: async () => {}
}
