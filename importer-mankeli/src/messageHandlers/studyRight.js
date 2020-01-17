const { flatten } = require('lodash')
const { sequelize } = require('../db/connection')
const { StudyRight } = require('../db/models')
const { valuefy } = require('../utils')

const parseStudyRight = studyRight => {
  return {
    id: studyRight.id,
    personId: studyRight.studentId,
    educationId: studyRight.educationId,
    organisationId: studyRight.organisationId,
    state: studyRight.state,
    documentState: studyRight.documentState,
    valid: JSON.stringify(studyRight.valid),
    grantDate: studyRight.grantDate,
    studyStartDate: studyRight.studyStartDate,
    transferOutDate: studyRight.transferOutDate,
    termRegistrations: JSON.stringify(studyRight.termRegistrations),
    studyRightCancellation: JSON.stringify(studyRight.studyRightCancellation),
    studyRightGraduation: JSON.stringify(studyRight.studyRightGraduation),
    modificationOrdinal: studyRight.metadata.modificationOrdinal
  }
}

// Studyrights are a bit special compared to other entities. There can be
// different instances of the same studyright (snapshots), thus we can't always override
// on conflict. At the moment, we want to store the instance with the highest modification ordinal.
module.exports = async ({ active, deleted, executionHash }, transaction) => {
  const parsedStudyRights = [...active, ...deleted].map(parseStudyRight)

  const nameToField = Object.entries(StudyRight.rawAttributes).reduce((res, [key, { field }]) => {
    if (!['created_at', 'updated_at'].includes(field)) res[key] = field
    return res
  }, {})

  const sortedNames = Object.keys(nameToField).sort((a, b) => {
    return nameToField[a].localeCompare(nameToField[b])
  })

  const sortedFields = Object.values(nameToField)
    .sort()
    .concat('created_at', 'updated_at')

  const paramify = () =>
    `(${Array(sortedNames.length)
      .fill('?')
      .join(',')}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

  await sequelize.query(
    `
    INSERT INTO studyrights (${sortedFields.join(',')})
    VALUES ${parsedStudyRights.map(paramify)}
    ON CONFLICT (id) DO UPDATE SET
    ${sortedFields.map(f => `"${f}"=EXCLUDED."${f}"`).join(',')}
    WHERE NOT EXISTS (
        SELECT * FROM studyrights WHERE id=excluded.id AND modification_ordinal > excluded.modification_ordinal
    )
    RETURNING *
  `,
    {
      replacements: flatten(parsedStudyRights.map(s => sortedNames.map(name => s[name]).map(valuefy))),
      transaction
    }
  )

  return { executionHash }
}
