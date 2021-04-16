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

  async getCourseUnitRealisationsRecursively() {
    // Does not look in parents; only realisations of this organisation and children of this organisation are returned.
    const recursivelyFindAllOrganisationIds = `WITH RECURSIVE childorgs AS (SELECT id, parent_id, code, name FROM organisations WHERE id='${this.id}' UNION SELECT o.id, o.parent_id, o.code, o.name FROM organisations o INNER JOIN childorgs co ON co.id = o.parent_id) SELECT DISTINCT id FROM childorgs`
    
    const realisations = await sequelize.query(
      `SELECT * FROM course_unit_realisations WHERE assessment_item_ids && ARRAY(
        SELECT id FROM assessment_items WHERE primary_course_unit_group_id IN (
          SELECT group_id FROM course_units cu, jsonb_array_elements(cu.organisations) orgs WHERE orgs->>'organisationId' IN (
            ${recursivelyFindAllOrganisationIds}
          )
        )
      );`,
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
