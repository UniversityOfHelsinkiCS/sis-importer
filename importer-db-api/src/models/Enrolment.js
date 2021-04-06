const { Model, STRING, DATE, BIGINT, ARRAY, JSONB, Op } = require('sequelize')
const { sequelize } = require('../config/db')

class Enrolment extends Model {}

Enrolment.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      unique: true,
    },
    modificationOrdinal: {
      type: BIGINT,
      unique: true,
    },
    personId: {
      type: STRING,
    },
    verifierPersonId: {
      type: STRING,
    },
    studyRightId: {
      type: STRING,
    },
    assessmentItemId: {
      type: STRING,
    },
    courseUnitRealisationId: {
      type: STRING,
    },
    courseUnitId: {
      type: STRING,
    },
    enrolmentDateTime: {
      type: DATE,
    },
    state: {
      type: STRING,
    },
    documentState: {
      type: STRING,
    },
    study_sub_groups: {
      type: JSONB,
    },
  },
  {
    underscored: true,
    sequelize: sequelize,
    modelName: 'enrolment',
    tableName: 'enrolments',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modificationOrdinal'],
      },
      {
        fields: ['id'],
      },
    ],
    defaultScope: {
      where: {
        documentState: {
          [Op.not]: 'DELETED',
        },
      },
    },
  }
)

module.exports = Enrolment
