const { readFileSync } = require('fs')


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

// Following files should include studentnumbers according to their name: first for
// new degree programme bsc students, second for new msc students, third for everything
// else (doctor + old programmes)
const bscStudents = getStudentNumbers("bsc_students.txt")
const mscStudents = getStudentNumbers("msc_students.txt")
const otherStudents = getStudentNumbers("other_students.txt")

module.exports = {
  bscStudents, mscStudents, otherStudents
}
