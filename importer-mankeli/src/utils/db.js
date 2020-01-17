const { Op } = require('sequelize')

const getColumnsToUpdate = (model, primaryKey) => Object.keys(model.rawAttributes).filter(a => a !== primaryKey)

const bulkCreate = async (model, entities, transaction, property = 'id') => {
  await model.bulkCreate(entities, {
    updateOnDuplicate: getColumnsToUpdate(model, property),
    transaction
  })
}

const bulkDelete = async (model, ids, transaction, property = 'id') => {
  await model.destroy({
    where: {
      [property]: {
        [Op.in]: ids
      }
    },
    transaction
  })
}

module.exports = {
  bulkCreate,
  bulkDelete,
  getColumnsToUpdate
}
