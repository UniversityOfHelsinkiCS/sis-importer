const { stan, opts } = require('../utils/stan')
const { NATS_GROUP } = require('../config')

const { connection } = require('../db/connection')

let postUpdateRunning = false

const clearCourseUnitAttainmentsWithoutCourseUnits = async () => {
  console.log('Start queries')
  let [res] = await connection.sequelize.query(`
  WITH attainment_ids AS ( SELECT id FROM attainments WHERE attainments.type = 'CourseUnitAttainment' AND NOT EXISTS (SELECT 1 FROM course_units where course_units.id = attainments.course_unit_id))
  DELETE FROM attainments WHERE id IN (SELECT id FROM attainment_ids)
  `)
  console.log(res)

}

const postUpdate = async () => {
  return // Feature toggle
  if (postUpdateRunning) return
  postUpdateRunning = true
  await clearCourseUnitAttainmentsWithoutCourseUnits() 
  postUpdateRunning = false
}

const initializePostUpdateChannel = () => {
  const channel = stan.subscribe('POST_UPDATE', NATS_GROUP, opts)
  channel.on('message', async (msg) => {
    const data = JSON.parse(msg.getData())

    if (data.success) await postUpdate()

    msg.ack()
  })
}

module.exports = initializePostUpdateChannel