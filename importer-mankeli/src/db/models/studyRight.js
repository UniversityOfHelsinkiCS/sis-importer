const { Model, STRING, DATE, BIGINT, JSONB, BOOLEAN, ARRAY } = require('sequelize')
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
      type: STRING
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
      type: BIGINT
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
      type: JSONB
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
      type: JSONB
    },
    transferOutUniversityUrn: {
      type: STRING
    },
    requestedSelectionPath: {
      type: JSONB
    },
    phase1MinorSelections: {
      type: JSONB
    },
    phase2MinorSelections: {
      type: JSONB
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
    studyRightExpirationRulesUrn: {
      type: ARRAY(STRING)
    },
    admissionTypeUrn: {
      type: STRING
    },
    codeUrns: {
      type: ARRAY(STRING)
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
        fields: ['id', 'modification_ordinal']
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
