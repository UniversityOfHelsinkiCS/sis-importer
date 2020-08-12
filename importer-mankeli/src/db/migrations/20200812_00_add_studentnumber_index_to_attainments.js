module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('attainments', ['person_student_number'])
  },
  down: async queryInterface => {
    await queryInterface.removeIndex('attainments', ['person_student_number'])
  }
}
