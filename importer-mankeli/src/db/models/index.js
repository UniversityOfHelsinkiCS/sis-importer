const CourseUnit = require('./courseUnit')
const Education = require('./education')
const Person = require('./person')
const StudyRight = require('./studyRight')

Person.hasMany(StudyRight)
Education.hasMany(StudyRight)

StudyRight.belongsTo(Person)
StudyRight.belongsTo(Education)

module.exports = {
  CourseUnit,
  Education,
  Person,
  StudyRight
}
