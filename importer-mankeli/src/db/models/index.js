const CourseUnit = require('./courseUnit')
const Education = require('./education')
const Person = require('./person')
const StudyRight = require('./studyRight')
const AssessmentItem = require('./assessmentItem')
const CourseUnitRealisation = require('./courseUnitRealisation')
const Attainment = require('./attainment')
const Module = require('./module')
const Organisation = require('./organisation')
const TermRegistration = require('./termRegistration')
const StudyLevel = require('./studyLevel')
const StudyYear = require('./studyYear')
const GradeScale = require('./gradeScale')
const Country = require('./country')
const EducationType = require('./educationType')
const StudyRightPrimality = require('./studyRightPrimality')
const Enrolment = require('./enrolment')
const DegreeTitle = require('./degreeTitle')
const EducationClassification = require('./educationClassification')
const StudyRightExpirationRule = require('./studyRightExpirationRule')
const AdmissionType = require('./admissionType')
const Plan = require('./plan')
const PersonGroup = require('./personGroup')
const StudyEvent = require('./studyEvent')

Person.hasMany(StudyRight)
Education.hasMany(StudyRight)

StudyRight.belongsTo(Person)
StudyRight.belongsTo(Education)

module.exports = {
  CourseUnit,
  Education,
  Person,
  StudyRight,
  AssessmentItem,
  CourseUnitRealisation,
  Attainment,
  Module,
  Organisation,
  TermRegistration,
  StudyLevel,
  StudyYear,
  GradeScale,
  Country,
  EducationType,
  StudyRightPrimality,
  Enrolment,
  DegreeTitle,
  EducationClassification,
  StudyRightExpirationRule,
  AdmissionType,
  Plan,
  PersonGroup,
  StudyEvent
}
