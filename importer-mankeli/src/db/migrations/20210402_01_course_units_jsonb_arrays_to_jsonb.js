const { JSONB } = require('sequelize')

const migrateColumnFromJSONBArrayToJSONB = (queryInterface, transaction) => async (table, column) => {
  const tempColumnName = `temp_${column}`
  await queryInterface.renameColumn(table, column, tempColumnName, { transaction })
  await queryInterface.addColumn(table, column, JSONB, { transaction })
  await queryInterface.sequelize.query(`UPDATE ${table} SET ${column}=array_to_json(${tempColumnName})::jsonb`, { transaction })
  await queryInterface.removeColumn(table, tempColumnName, { transaction })
}

module.exports = {
  up: async queryInterface => {
    const t = await queryInterface.sequelize.transaction()
    try {
      // course_units -> organisations, substitutions, completion_methods, responsibility_infos
      const columnFromJSONBArrayToJSONB = migrateColumnFromJSONBArrayToJSONB(queryInterface, t)
      await columnFromJSONBArrayToJSONB('course_units', 'organisations')
      await columnFromJSONBArrayToJSONB('course_units', 'substitutions')
      await columnFromJSONBArrayToJSONB('course_units', 'completion_methods')
      await columnFromJSONBArrayToJSONB('course_units', 'responsibility_infos')
      t.commit()
    } catch (err) {
      t.rollback()
      throw err
    }
  },
  down: async queryInterface => {}
}
