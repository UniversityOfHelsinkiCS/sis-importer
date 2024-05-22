const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class AdmissionType extends Model {}

AdmissionType.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    name: {
      type: JSONB
    },
    createdAt: {
      type: DATE
    },
    updatedAt: {
      type: DATE
    }
  },
  {
    underscored: true,
    sequelize: connection.sequelize,
    modelName: 'admission_type',
    tableName: 'admission_types'
  }
)

module.exports = AdmissionType
