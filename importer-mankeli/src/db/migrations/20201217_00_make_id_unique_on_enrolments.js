const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.removeColumn('enrolments', 'auto_id')
    await queryInterface.bulkDelete('enrolments')
    await queryInterface.removeIndex('enrolments', ['id', 'modificationOrdinal'])
    await queryInterface.changeColumn('enrolments', 'id', {
      type: STRING,
      unique: true
    })
    await queryInterface.addConstraint('enrolments', {
      fields: ['id'],
      type: 'primary key'
    })
  },
  down: async () => {}
}
