const { StudyRightPrimality } = require('../db/models')
const { bulkCreate } = require('../utils/db')
const { connection } = require('../db/connection')

const parseStudyRightPrimality = studyRightPrimality => {
  return {
    studyRightId: studyRightPrimality.studyRightId,
    studentId: studyRightPrimality.studentId,
    startDate: studyRightPrimality.startDate,
    endDate: studyRightPrimality.endDate
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(StudyRightPrimality, active.map(parseStudyRightPrimality), transaction, [
    'studyRightId',
    'studentId',
    'startDate'
  ])

  // Bulk delete by composite primary key
  await connection.sequelize.query(
    `
    DELETE FROM study_right_primalities
    WHERE (study_right_id, student_id, start_date)
    IN (${deleted.map(() => '(?, ?, ?)').join(',') || 'NULL'})
  `,
    {
      replacements: deleted.reduce((res, curr) => {
        res.push(curr.studyRightId, curr.studentId, curr.startDate)
        return res
      }, []),
      transaction
    }
  )
}
