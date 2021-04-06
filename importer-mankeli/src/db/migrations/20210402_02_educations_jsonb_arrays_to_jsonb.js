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
      const columnFromJSONBArrayToJSONB = migrateColumnFromJSONBArrayToJSONB(queryInterface, t)
      // educations -> organisations, responsibility_infos
      await columnFromJSONBArrayToJSONB('educations', 'organisations')
      await columnFromJSONBArrayToJSONB('educations', 'responsibility_infos')
      t.commit()
    } catch (err) {
      t.rollback()
      throw err
    }
  },
  down: async queryInterface => {}
}
