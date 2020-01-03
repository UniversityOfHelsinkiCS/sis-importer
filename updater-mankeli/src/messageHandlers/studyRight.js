const { parseDate } = require('../utils')

const parseStudyRight = studyRight => {
  // termRegistrations?
  const TODO = undefined
  return {
    studyrightid: studyRight.id,
    canceldate: studyRight.studyRightCancellation ? studyRight.studyRightCancellation.cancellationDate : null,
    enddate: studyRight.valid.endDate ? parseDate(studyRight.valid.endDate) : null,
    education_id: studyRight.educationId,
    extentcode: TODO, // from educationId
    givendate: parseDate(studyRight.grantDate),
    graduated: !!studyRight.studyRightGraduation,
    graduation_date: studyRight.studyRightGraduation
      ? studyRight.studyRightGraduation.phase1GraduationDate || studyRight.studyRightGraduation.phase2GraduationDate
      : null, // Validate this
    prioritycode: TODO, // doesn't exist anymore?
    startdate: parseDate(studyRight.valid.startDate),
    studystartdate: parseDate(studyRight.studyStartDate),
    organization_code: studyRight.organisationId,
    student_id: studyRight.studentId,
    student_studentnumber: TODO, // from studentId
    faculty_code: TODO // from organization_code
  }
}

module.exports = ({ entities, executionHash }) => {
  entities.map(parseStudyRight)

  return { executionHash }
}
