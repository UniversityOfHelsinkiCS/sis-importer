const moment = require('moment')
const { getDate, parseDate } = require('../utils')

const parseCreditTypeCode = attainment => {
  if (attainment.misregistration) return 5
  if (!attainment.primary) return 7
  if (attainment.expiryDate && moment(attainment.expiryDate).isBefore(moment())) return 6

  switch (attainment.state) {
    case 'ATTAINED':
      return 4
    case 'SUBSTITUTED':
    case 'INCLUDED':
      return 9
    case 'FAILED':
      return 10
  }
}

const parseCredit = attainment => {
  const TODO = undefined
  return {
    id: attainment.id,
    grade: attainment.gradeId,
    credits: attainment.credits,
    ordering: getDate(attainment.attainmentDate),
    credittypecode: parseCreditTypeCode(attainment),
    person_id: attainment.personId,
    student_studentnumber: attainment.personStudentNumber,
    attainment_date: parseDate(attainment.attainmentDate),
    course_unit_id: attainment.courseUnitId,
    course_unit_realisation_id: attainment.courseUnitRealisationId,
    course_code: TODO, // from course unit
    semestercode: TODO, // from course unit realisation
    isStudyModule: false, // groupId?
    documentState: attainment.documentState
  }
}

module.exports = ({ entities, executionHash }) => {
  entities.map(parseCredit)
  return { executionHash }
}
