// This file includes studentnumber that have been selected from oodikone database
// created from full sis-test-db dump
// Students have been selected by following rules:
// - 500 students with studyright for 2017+ bsc/msc -program and studyright studystartdate for 2017+
// - 500 students with studyright for old program / doctoral program and studyright studystartdate for 2010+

const getStudentNumbers = (filename) => {
  try {
    const data = readFileSync(`${__dirname}/${filename}`).toString()
    if (!data) return []
    return data.split('\n')
  } catch (error) {
    console.log(error)
    throw new Error()
  }
}

const bscStudents = getStudentNumbers("bsc_students.txt")
const mscStudents = getStudentNumbers("msc_students.txt")
const otherStudents = getStudentNumbers("other_students.txt")

module.exports = {
  bscStudents, mscStudents, otherStudents
}
