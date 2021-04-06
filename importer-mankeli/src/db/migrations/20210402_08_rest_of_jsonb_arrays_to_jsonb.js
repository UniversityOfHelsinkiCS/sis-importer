const { JSONB } = require('sequelize')

const migrateColumnFromJSONBArrayToJSONB = (queryInterface, transaction) => async (table, column) => {
  const tempColumnName = `temp_${column}`
  await queryInterface.renameColumn(table, column, tempColumnName, { transaction })
  await queryInterface.addColumn(table, column, JSONB, { transaction })
  await queryInterface.sequelize.query(`UPDATE ${table} SET ${column}=array_to_json(${tempColumnName})::jsonb`, {
    transaction
  })
  await queryInterface.removeColumn(table, tempColumnName, { transaction })
}

module.exports = {
  up: async queryInterface => {
    const t = await queryInterface.sequelize.transaction()
    try {
      const columnFromJSONBArrayToJSONB = migrateColumnFromJSONBArrayToJSONB(queryInterface, t)
      // term_registrations -> term_registrations
      await columnFromJSONBArrayToJSONB('term_registrations', 'term_registrations')
      // study_years -> study_terms
      await columnFromJSONBArrayToJSONB('study_years', 'study_terms')
      // grade_scales -> grades
      await columnFromJSONBArrayToJSONB('grade_scales', 'grades')
      // enrolments -> study_sub_groups
      await columnFromJSONBArrayToJSONB('enrolments', 'study_sub_groups')
      t.commit()
    } catch (err) {
      t.rollback()
      throw err
    }
  },
  down: async () => {}
}
