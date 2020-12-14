const { STRING, DATE, BIGINT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('enrolments', {
      auto_id: {
        type: BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      id: {
        type: STRING
      },
      person_id: {
        type: STRING
      },
      verifier_person_id: {
        type: STRING
      },
      study_right_id: {
        type: STRING
      },
      assessment_item_id: {
        type: STRING
      },
      course_unit_realisation_id: {
        type: STRING
      },
      course_unit_id: {
        type: STRING
      },
      enrolment_date_time: {
        type: DATE
      },
      state: {
        type: STRING
      },
      modification_ordinal: {
        type: BIGINT
      },
      created_at: {
        type: DATE
      },
      updated_at: {
        type: DATE
      }
    })
    await queryInterface.addIndex('enrolments', ['id', 'modification_ordinal'], { unique: true })
    await queryInterface.addIndex('enrolments', ['id'])
  },
  down: async () => {}
}
