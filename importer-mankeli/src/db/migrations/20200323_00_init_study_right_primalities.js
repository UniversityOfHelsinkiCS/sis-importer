const { STRING, DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('study_right_primalities', {
      study_right_id: {
        primaryKey: true,
        type: STRING
      },
      student_id: {
        primaryKey: true,
        type: STRING
      },
      start_date: {
        primaryKey: true,
        type: DATE
      },
      end_date: {
        type: DATE
      },
      created_at: {
        type: DATE
      },
      updated_at: {
        type: DATE
      }
    })
  },
  down: async () => {}
}
