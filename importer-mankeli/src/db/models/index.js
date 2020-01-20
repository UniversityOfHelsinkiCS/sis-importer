const CourseUnit = require('./courseUnit')
const Education = require('./education')
const Person = require('./person')
const StudyRight = require('./studyRight')
const AssessmentItem = require('./assessmentItem')
const CourseUnitRealisation = require('./courseUnitRealisation')
const Attainment = require('./attainment')
const Module = require('./module')

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
  Module
}
