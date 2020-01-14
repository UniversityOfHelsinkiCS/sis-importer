const { ARRAY, STRING, DATE, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.createTable('educations', {
        id: {
          type: STRING,
          primaryKey: true
        },
        group_id: {
          type: STRING
        },
        name: {
          type: JSONB
        },
        code: {
          type: STRING
        },
        education_type: {
          type: STRING
        },
        validity_period: {
          type: JSONB
        },
        organisations: {
          type: ARRAY(JSONB)
        },
        university_org_ids: {
          type: ARRAY(STRING)
        },
        attainment_languages: {
          type: ARRAY(STRING)
        },
        structure: {
          type: JSONB
        },
        study_fields: {
          type: ARRAY(STRING)
        },
        responsibility_infos: {
          type: ARRAY(JSONB)
        },
        created_at: {
          type: DATE
        },
        updated_at: {
          type: DATE
        }
      })
    ])
  },
  down: async () => {}
}
