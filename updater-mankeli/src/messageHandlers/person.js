const privatePersonsQuery = require('../queries/privatePersons')
const { idfy, getDate } = require('../utils')

/* const getStudentFromDataOld = (student, studyrights) => {
  const country = getTextsByLanguage(student.country)
  const gender = getTextsByLanguage(student.gender)
  return {
    studentnumber: student.student_number,
    email: student.email,
    creditcount: student.studyattainments, // TODO
    birthdate: getDate(student.birth_date),
    lastname: student.last_name,

    country_fi: country.fi,
    country_sv: country.sv,
    country_en: country.en,

    firstnames: student.first_names,
    dateofuniversityenrollment: universityEnrollmentDateFromStudyRights(studyrights),
    abbreviatedname: [student.last_name, student.first_names].join(' '),
    gender_code: student.gender_code,
    gender_fi: gender.fi,
    gender_sv: gender.sv,
    gender_en: gender.en
  }
}
 */
const genderCodesToNames = {
  'urn:code:gender:other': {
    name: {
      en: 'Other',
      fi: 'Muu',
      sv: 'Andra'
    }
  },
  'urn:code:gender:male': {
    name: {
      en: 'Male',
      fi: 'Mies',
      sv: 'Man'
    }
  },
  'urn:code:gender:female': {
    name: {
      en: 'Female',
      fi: 'Nainen',
      sv: 'Kvinna'
    }
  }
}

const parseGender = code => {
  if (!code) return { gender_fi: null, gender_en: null, gender_sv: null }
  const { fi: gender_fi, en: gender_en, sv: gender_sv } = genderCodesToNames[code]
  return { gender_fi, gender_en, gender_sv }
}

const parseCountry = address => {
  if (!(address && address.country && address.country.name))
    return { country_fi: null, country_en: null, country_sv: null }
  const { fi: country_fi, en: country_en, sv: country_sv } = address.country.name
  return { country_fi, country_en, country_sv }
}

const getPersonFromData = (person, additionalData) => {
  return {
    studentnumber: person.studentNumber,
    email: person.primaryEmail,
    creditcount: null, // TODO
    birthdate: getDate(person.dateOfBirth),
    lastname: person.lastName,
    ...parseCountry(additionalData.primaryAddress),

    firstnames: person.firstNames,
    dateofuniversityenrollment: null, // TODO
    abbreviatedname: [person.lastName, person.firstNames].join(' '),
    gender_code: person.genderUrn,
    ...parseGender(person.genderUrn)
  }
}

module.exports = async ({ entities, executionHash }) => {
  const ids = entities.map(person => person.id)
  const data = idfy((await privatePersonsQuery({ ids })).private_persons)
  entities.map(person => getPersonFromData(person, data[person.id]))

  return { executionHash }
}
