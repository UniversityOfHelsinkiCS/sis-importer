const CourseUnit = require('./CourseUnit')
const CourseUnitRealisation = require('./CourseUnitRealisation')
const Module = require('./Module')
const AssessmentItem = require('./AssessmentItem')
const Organisation = require('./Organisation')
const StudyRight = require('./StudyRight')
const Attainment = require('./Attainment')
const StudyYear = require('./StudyYear')
const Person = require('./Person')
const TermRegistrations = require('./TermRegistrations')
const Education = require('./Education')

StudyRight.belongsTo(Organisation, { foreignKey: 'organisationId', targetKey: 'id' })
Organisation.hasMany(StudyRight, { foreignKey: 'id', targetKey: 'organisationId' })

StudyRight.hasOne(Education, { sourceKey: 'educationId', foreignKey: 'id' })

const models = {
  CourseUnit,
  CourseUnitRealisation,
  Organisation,
  Module,
  AssessmentItem,
  StudyRight,
  Attainment,
  StudyYear,
  Person,
  TermRegistrations,
  Education,
}

module.exports = models
