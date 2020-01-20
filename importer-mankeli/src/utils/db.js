const { Op } = require('sequelize')

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

module.exports = {
  bulkCreate,
  bulkDelete,
  getColumnsToUpdate
}
