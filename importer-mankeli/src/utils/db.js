const { Op } = require('sequelize')
const Sentry = require('@sentry/node')
const { connection } = require('../db/connection')
const { logger } = require('./logger')

const getColumnsToUpdate = (model, keys) => Object.keys(model.rawAttributes).filter(a => !keys.includes(a))

const bulkCreate = async (model, entities, transaction, properties = ['id']) => {
  try {
    await model.bulkCreate(entities, {
      updateOnDuplicate: getColumnsToUpdate(model, properties),
      transaction
    })
  } catch (error) {
    // If one fails on bulkCreate, re-do them individually and report the individual failures.
    for (const entity of entities) {
      try {
        await model.upsert(entity, {
          updateOnDuplicate: getColumnsToUpdate(model, properties),
          transaction
        })
      } catch (e) {
        logger.error('Single-entity upsert failed: ', JSON.stringify(e, null, 2))
        logger.error('Entity:')
        logger.error(JSON.stringify(entity, null, 2))
        let message = ''
        if (e) message = e.message
        Sentry.captureMessage(`Operation failed: ${message}`)
        Sentry.captureException(e)
      }
    }
  }
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
    return await connection.sequelize.transaction()
  } catch (e) {
    logger.error(e)
    return null
  }
}

module.exports = {
  bulkCreate,
  bulkDelete,
  getColumnsToUpdate,
  createTransaction
}
