const { Model, STRING, JSONB, DATE } = require('sequelize')
const { connection } = require('../connection')

class EducationClassification extends Model {}

EducationClassification.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    name: {
      type: JSONB
    },
    shortName: {
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
    modelName: 'education_classification',
    tableName: 'education_classifications'
  }
)

module.exports = EducationClassification
