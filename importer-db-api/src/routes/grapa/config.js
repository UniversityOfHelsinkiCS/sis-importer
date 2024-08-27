const relevantAttributes = {
  persons: [
    'id',
    'edu_person_principal_name',
    'preferred_language_urn',
    'first_names',
    'last_name',
    'primary_email',
    'employee_number',
    'student_number'
  ]
}

const masterThesisCourseCode = 'urn:code:course-unit-type:masters-thesis'

module.exports = {
  relevantAttributes,
  masterThesisCourseCode
}
