const { Op } = require('sequelize')
const { connection } = require('../db/connection')

const getColumnsToUpdate = (model, keys) => Object.keys(model.rawAttributes).filter(a => !keys.includes(a))

const bulkCreate = async (model, entities, transaction, properties = ['id']) => {
  await model.bulkCreate(entities, {
    updateOnDuplicate: getColumnsToUpdate(model, properties),
    transaction
  })
}

const bulkDelete = async (model, entities, transaction, property = 'id') => {
  await model.destroy({
    where: {
      [property]: {
        [Op.in]: entities.map(entity => entity[property])
      }
    },
    transaction
  })
}

const createTransaction = async () => {
  try {
    const t = await connection.sequelize.transaction()
    return t
  } catch (e) {
    return null
  }
}

module.exports = {
  bulkCreate,
  bulkDelete,
  getColumnsToUpdate,
  createTransaction
}
