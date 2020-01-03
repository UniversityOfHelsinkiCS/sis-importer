const { getDate } = require('../utils')
const { getCountries, getGenders } = require('../utils/urnApi')

const parseGender = (code, genders) => {
  if (!(code && genders[code])) return { gender_fi: null, gender_en: null, gender_sv: null }
  const { fi: gender_fi, en: gender_en, sv: gender_sv } = genders[code].name
  return {
    gender_fi,
    gender_en,
    gender_sv,
    gender_code: code === 'urn:code:gender:male' ? 1 : code === 'urn:code:gender:female' ? 2 : 3
  }
}

const parseCountry = (address, countries) => {
  if (!(address && address.countryUrn && countries[address.countryUrn]))
    return { country_fi: null, country_en: null, country_sv: null }

  const { fi: country_fi, en: country_en, sv: country_sv } = countries[address.countryUrn].name
  return { country_fi, country_en, country_sv }
}

const parsePerson = (person, countries, genders) => {
  const TODO = undefined
  return {
    person_id: person.id,
    studentnumber: person.studentNumber,
    email: person.primaryEmail,
    creditcount: TODO,
    birthdate: getDate(person.dateOfBirth),
    lastname: person.lastName,
    ...parseCountry(person.primaryAddress, countries),

    firstnames: person.firstNames,
    dateofuniversityenrollment: TODO,
    abbreviatedname: [person.lastName, person.firstNames].join(' '),
    ...parseGender(person.genderUrn, genders)
  }
}

module.exports = async ({ entities, executionHash }) => {
  const countries = await getCountries()
  const genders = await getGenders()
  entities.map(p => parsePerson(p, countries, genders))
  // TODO: Send to updater writer, check operation type (create, delete or update)

  return { executionHash }
}
