const { Model, ARRAY, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')
const CourseUnit = require('./CourseUnit')

class Organisation extends Model {
  async getCourses() {
    const units = await sequelize.query(
      `SELECT * FROM course_units WHERE organisations[1]->>'organisationId' = '${this.id}';`,
      {
        model: CourseUnit,
        mapToModel: true,
      }
    )
    return units.map(unit => ({
      id: unit.id,
      code: unit.code,
      name: unit.name,
      validityPeriod: unit.validityPeriod
    }))
  }
}

Organisation.init(
  {
    autoId: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    id: {
      type: STRING,
      unique: true,
    },
    modificationOrdinal: {
      type: BIGINT,
      unique: true,
    },
    documentState: {
      type: STRING,
    },
    snapshotDateTime: {
      type: DATE,
    },
    universityOrgId: {
      type: STRING,
    },
    parentId: {
      type: STRING,
    },
    predecessorIds: {
      type: ARRAY(STRING),
    },
    code: {
      type: STRING,
    },
    name: {
      type: JSONB,
    },
    abbreviation: {
      type: JSONB,
    },
    status: {
      type: STRING,
    },
    educationalInstitutionUrn: {
      type: STRING,
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
  },
  {
    underscored: true,
    sequelize,
    modelName: 'organisation',
    tableName: 'organisations',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modificationOrdinal'],
      },
      {
        fields: ['id'],
      },
    ],
  }
)

module.exports = Organisation
