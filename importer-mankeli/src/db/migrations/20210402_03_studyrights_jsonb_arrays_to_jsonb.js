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
      // studyrights -> term_registrations, study_right_extensions, phase1_minor_selections, phase2_minor_selections
      await columnFromJSONBArrayToJSONB('studyrights', 'term_registrations')
      await columnFromJSONBArrayToJSONB('studyrights', 'study_right_extensions')
      await columnFromJSONBArrayToJSONB('studyrights', 'phase1_minor_selections')
      await columnFromJSONBArrayToJSONB('studyrights', 'phase2_minor_selections')
      t.commit()
    } catch (err) {
      t.rollback()
      throw err
    }
  },
  down: async () => {}
}
