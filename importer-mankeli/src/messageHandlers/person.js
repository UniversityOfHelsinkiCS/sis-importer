const { bulkCreate, bulkDelete } = require('../utils/db')
const { Person } = require('../db/models')

const parsePerson = person => {
  return {
    id: person.id,
    studentNumber: person.studentNumber,
    dateOfBirth: person.dateOfBirth,
    firstNames: person.firstNames,
    lastName: person.lastName,
    employeeNumber: person.employeeNumber,
    primaryEmail: person.primaryEmail,
    oppijaId: person.oppijaID,
    citizenships: person.citizenshipUrns,
    dead: person.dead,
    genderUrn: person.genderUrn,
    countryUrn: person.primaryAddress ? person.primaryAddress.countryUrn : null
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(Person, active.map(parsePerson), transaction)
  await bulkDelete(Person, deleted, transaction)
}
