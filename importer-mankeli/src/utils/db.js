const { Op } = require('sequelize')

const getColumnsToUpdate = arr => (arr[0] ? Object.keys(arr[0]) : [])

const bulkCreate = async (model, entities, transaction) => {
  await model.bulkCreate(entities, {
    updateOnDuplicate: getColumnsToUpdate(entities),
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
  bulkDelete
}
