const { bulkCreate, bulkDelete } = require('../utils/db')
const { Person } = require('../db/models')

const parsePerson = person => {
  return {
    id: person.id,
    studentNumber: person.studentNumber,
    dateOfBirth: person.dateOfBirth,
    firstNames: person.firstNames,
    lastName: person.lastName,
    callName: person.callName,
    eduPersonPrincipalName: person.eduPersonPrincipalName,
    employeeNumber: person.employeeNumber,
    primaryEmail: person.primaryEmail,
    phoneNumber: person.phoneNumber,
    oppijaId: person.oppijaID,
    citizenships: person.citizenshipUrns,
    dead: person.dead,
    genderUrn: person.genderUrn,
    countryUrn: person.primaryAddress ? person.primaryAddress.countryUrn : null,
    preferredLanguageUrn: person.preferredLanguageUrn,
    secondaryEmail: person.secondaryEmail
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(Person, active.map(parsePerson), transaction)
  await bulkDelete(Person, deleted, transaction)
}
