const { Disclosure } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseDisclosures = disclosure => ({
  id: disclosure.id,
  personId: disclosure.privatePersonId,
  disclosureCategoryId: disclosure.disclosureCategoryId,
  authorized: disclosure.authorized,
  documentState: disclosure.documentState
})

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(Disclosure, active.map(parseDisclosures), transaction)
  await bulkDelete(Disclosure, deleted, transaction)
}
