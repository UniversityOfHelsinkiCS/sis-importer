const { Model, ARRAY, STRING, DATE, BIGINT, JSONB, BOOLEAN } = require('sequelize')
const { connection } = require('../connection')

class StudyRight extends Model {}

StudyRight.init(
  {
    autoId: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: STRING,
      unique: true
    },
    personId: {
      type: STRING
    },
    state: {
      type: STRING
    },
    educationId: {
      type: STRING
    },
    organisationId: {
      type: STRING
    },
    modificationOrdinal: {
      type: BIGINT,
      unique: true
    },
    documentState: {
      type: STRING
    },
    valid: {
      type: JSONB
    },
    grantDate: {
      type: DATE
    },
    studyStartDate: {
      type: DATE
    },
    transferOutDate: {
      type: DATE
    },
    termRegistrations: {
      type: ARRAY(JSONB)
    },
    studyRightCancellation: {
      type: JSONB
    },
    studyRightGraduation: {
      type: JSONB
    },
    snapshotDateTime: {
      type: DATE
    },
    acceptedSelectionPath: {
      type: JSONB
    },
    studyRightTransfer: {
      type: JSONB
    },
    studyRightExtensions: {
      type: ARRAY(JSONB)
    },
    transferOutUniversityUrn: {
      type: STRING
    },
    requestedSelectionPath: {
      type: JSONB
    },
    phase1MinorSelections: {
      type: ARRAY(JSONB)
    },
    phase2MinorSelections: {
      type: ARRAY(JSONB)
    },
    phase1EducationClassificationUrn: {
      type: STRING
    },
    phase2EducationClassificationUrn: {
      type: STRING
    },
    phase1EducationClassificationLocked: {
      type: BOOLEAN
    },
    phase2EducationClassificationLocked: {
      type: BOOLEAN
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
    modelName: 'studyright',
    tableName: 'studyrights',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modificationOrdinal']
      },
      {
        fields: ['id']
      },
      {
        fields: ['person_id']
      }
    ]
  }
)

module.exports = StudyRight
