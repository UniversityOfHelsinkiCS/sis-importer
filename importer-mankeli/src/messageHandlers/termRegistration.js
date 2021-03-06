const { TermRegistration } = require('../db/models')
const { bulkCreate } = require('../utils/db')
const { connection } = require('../db/connection')

const parseTermRegistration = termRegistration => {
  return {
    studyRightId: termRegistration.studyRightId,
    studentId: termRegistration.studentId,
    termRegistrations: termRegistration.termRegistrations
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(TermRegistration, active.map(parseTermRegistration), transaction, ['studyRightId', 'studentId'])

  // Bulk delete by composite primary key
  await connection.sequelize.query(
    `
    DELETE FROM term_registrations
    WHERE (study_right_id, student_id)
    IN (${deleted.map(() => '(?, ?)').join(',') || 'NULL'})
  `,
    {
      replacements: deleted.reduce((res, curr) => {
        res.push(curr.studyRightId, curr.studentId)
        return res
      }, []),
      transaction
    }
  )
}
