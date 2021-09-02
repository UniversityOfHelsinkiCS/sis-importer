const { stan, opts } = require('../utils/stan')
const { NATS_GROUP, IS_DEV } = require('../config')

const { connection } = require('../db/connection')

const sendToStan = (channel, message) =>
  new Promise((res, rej) => {
    stan.publish(channel, JSON.stringify(message), err => {
      if (err) return rej(err)
      res()
    })
  })

const removeOpenUniversityStudyRights = async () => {
  return connection.sequelize.query(
    `
    DELETE FROM studyrights
    WHERE studyrights.education_id IN (
      SELECT educations.id FROM educations
      LEFT JOIN education_types ON education_types.id = educations.education_type
      WHERE education_types.parent_id = 'urn:code:education-type:non-degree-education'
    );
    `
  )
}

const postUpdate = async () => {
  if (IS_DEV) return console.log('Skipping post update in dev env')
  console.log('Post Update Start')

  // await removeOpenUniversityStudyRights()

  sendToStan('POST_UPDATE_FINISH', { success: true })
}

const initializePostUpdateChannel = () => {
  const channel = stan.subscribe('POST_UPDATE', NATS_GROUP, opts)
  channel.on('message', async msg => {
    const data = JSON.parse(msg.getData())

    if (data.success) await postUpdate()

    msg.ack()
  })
}

module.exports = initializePostUpdateChannel
