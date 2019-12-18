const privatePersonsQuery = require('../queries/privatePersons')
const { idfy, getDate } = require('../utils')

const genderCodesToValues = {
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

const calculateCredits = credits => {
  if (!credits) return 0
  return credits.reduce((acc, { credits, misregistration, primary, state }) => {
    return !misregistration && primary && state !== 'FAILED' ? acc + credits : acc
  }, 0)
}

const parseGender = code => {
  if (!code) return { gender_fi: null, gender_en: null, gender_sv: null }
  const { fi: gender_fi, en: gender_en, sv: gender_sv } = genderCodesToValues[code]
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
    creditcount: calculateCredits(additionalData.attainments),
    birthdate: getDate(person.dateOfBirth),
    lastname: person.lastName,
    ...parseCountry(additionalData.primaryAddress),

    firstnames: person.firstNames,
    dateofuniversityenrollment: getDate(additionalData.studyStartDate), // First present
    abbreviatedname: [person.lastName, person.firstNames].join(' '),
    gender_code: person.genderUrn,
    ...parseGender(person.genderUrn)
  }
}

module.exports = async ({ entities, executionHash }) => {
  const ids = entities.map(person => person.id)
  const personToAdditionalData = idfy((await privatePersonsQuery({ ids })).private_persons)
  entities.map(person => getPersonFromData(person, personToAdditionalData[person.id]))

  // TODO: Send to updater writer, check operation type (create, delete or update)

  return { executionHash }
}
