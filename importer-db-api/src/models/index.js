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
const Enrolment = require('./Enrolment')
const GradeScale = require('./GradeScale')
const Plan = require('./Plan')

StudyRight.belongsTo(Organisation, { foreignKey: 'organisationId', targetKey: 'id' })
Organisation.hasMany(StudyRight, { foreignKey: 'id', targetKey: 'organisationId' })

StudyRight.hasOne(Education, { sourceKey: 'educationId', foreignKey: 'id' })

AssessmentItem.belongsTo(CourseUnit, { foreignKey: 'primaryCourseUnitGroupId', targetKey: 'groupId', as: 'courseUnit' })

Enrolment.belongsTo(AssessmentItem, { foreignKey: 'assessmentItemId', targetKey: 'id', as: 'assessmentItem' })
Enrolment.belongsTo(CourseUnitRealisation, {
  foreignKey: 'courseUnitRealisationId',
  targetKey: 'id',
  as: 'courseUnitRealisation',
})
Enrolment.belongsTo(CourseUnit, { foreignKey: 'courseUnitId', targetKey: 'id', as: 'courseUnit' })
Enrolment.belongsTo(Person, { foreignKey: 'personId', targetKey: 'id' })

Person.hasMany(StudyRight, { sourceKey: 'id', foreignKey: 'personId' })
StudyRight.belongsTo(Person, { foreignKey: 'personId', targetKey: 'id' })

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
  Enrolment,
  GradeScale,
  Plan,
}

module.exports = models
