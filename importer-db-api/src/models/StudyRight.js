const { Model, STRING, DATE, BIGINT, JSONB } = require('sequelize')
const { sequelize } = require('../config/db')

class StudyRight extends Model {}

StudyRight.init(
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
    personId: {
      type: STRING,
    },
    state: {
      type: STRING,
    },
    educationId: {
      type: STRING,
    },
    organisationId: {
      type: STRING,
    },
    modificationOrdinal: {
      type: BIGINT,
      unique: true,
    },
    documentState: {
      type: STRING,
    },
    valid: {
      type: JSONB,
    },
    grantDate: {
      type: DATE,
    },
    studyStartDate: {
      type: DATE,
    },
    transferOutDate: {
      type: DATE,
    },
    termRegistrations: {
      type: JSONB,
    },
    studyRightCancellation: {
      type: JSONB,
    },
    studyRightGraduation: {
      type: JSONB,
    },
    snapshotDateTime: {
      type: DATE,
    },
    acceptedSelectionPath: {
      type: JSONB,
    },
    studyRightTransfer: {
      type: JSONB,
    },
    studyRightExtensions: {
      type: JSONB,
    },
    transferOutUniversityUrn: {
      type: STRING,
    },
    requestedSelectionPath: {
      type: JSONB,
    },
    phase1MinorSelections: {
      type: JSONB,
    },
    phase2MinorSelections: {
      type: JSONB,
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
    sequelize: sequelize,
    modelName: 'studyright',
    tableName: 'studyrights',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modificationOrdinal'],
      },
      {
        fields: ['id'],
      },
      {
        fields: ['person_id'],
      },
    ],
  }
)

module.exports = StudyRight
