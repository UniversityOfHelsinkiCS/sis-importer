const { Model, Op, ARRAY, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')
const CourseUnitRealisation = require('./CourseUnitRealisation')
const CourseUnit = require('./CourseUnit')

class Organisation extends Model {
  async getCourseUnits() {
    const units = await CourseUnit.findAll({
      where: {
        organisations: {
          [Op.contains]: [
            {
              organisationId: this.id,
            },
          ],
        },
      },
    })

    return units
  }

  async getCourseUnitRealisations() {
    const realisations = await sequelize.query(
      `select * from course_unit_realisations where assessment_item_ids && ARRAY((select id from assessment_items where primary_course_unit_group_id in (select group_id from course_units where organisations @> '[{ "organisationId": "${this.id}"}]')));`,
      {
        model: CourseUnitRealisation,
        mapToModel: true,
      }
    )

    return realisations
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
