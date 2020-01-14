const { bulkCreate, bulkDelete } = require('../utils/db')
const { getCountries, getGenders } = require('../utils/urnApi')
const Person = require('../db/models/person')

const parseGender = (genderUrn, genders) => {
  if (!(genderUrn && genders[genderUrn])) return { genderFi: null, genderEn: null, genderSv: null, genderUrn: null }
  const { fi: genderFi, en: genderEn, sv: genderSv } = genders[genderUrn].name
  return {
    genderFi,
    genderEn,
    genderSv,
    genderUrn
  }
}

const parseCountry = (address, countries) => {
  if (!(address && address.countryUrn && countries[address.countryUrn]))
    return { countryFi: null, countryEn: null, countrySv: null, countryUrn: null }

  const { fi: countryFi, en: countryEn, sv: countrySv } = countries[address.countryUrn].name
  return { countryFi, countryEn, countrySv, countryUrn: address.countryUrn }
}

const parsePerson = (person, countries, genders) => {
  return {
    id: person.id,
    studentNumber: person.studentNumber,
    dateOfBirth: person.dateOfBirth,
    firstNames: person.firstNames,
    lastName: person.lastName,
    employeeNumber: person.employeeNumber,
    primaryEmail: person.primaryEmail,
    genderUrn: person.genderUrn,
    oppijaId: person.oppijaID,
    citizenships: person.citizenshipUrns,
    dead: person.dead,
    ...parseGender(person.genderUrn, genders),
    ...parseCountry(person.primaryAddress, countries)
  }
}

module.exports = async ({ active, deleted, executionHash }, transaction) => {
  const countries = await getCountries()
  const genders = await getGenders()

  await bulkCreate(
    Person,
    active.map(p => parsePerson(p, countries, genders)),
    transaction
  )
  await bulkDelete(Person, deleted, transaction)
  return { executionHash }
}
