const { ARRAY, STRING, DATE, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('term_registrations', {
      study_right_id: {
        primaryKey: true,
        type: STRING
      },
      student_id: {
        primaryKey: true,
        type: STRING
      },
      term_registrations: {
        type: ARRAY(JSONB)
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
