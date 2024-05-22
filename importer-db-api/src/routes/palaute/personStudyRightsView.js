const { sequelize } = require('../../config/db')
const { validEducations } = require('./config')

const VIEW_EXPIRATION_TIME = 1000 * 60 * 60 * 6 // 6 hours

let createdAt = null

const updateCreatedAt = () => {
  createdAt = Date.now()
}

const isExpired = () => {
  if (!createdAt) return false
  return Date.now() - createdAt > VIEW_EXPIRATION_TIME
}

let state = 'idle'

const createPersonStudyRightsView = async () => {
  console.log('Creating person study rights view...')
  state = 'creating'

  await sequelize.query(
    `
  DROP MATERIALIZED VIEW IF EXISTS person_study_rights_view;

  CREATE MATERIALIZED VIEW person_study_rights_view AS
    SELECT 
    P.id as person_id,
    (
        SELECT COUNT(E.*) 
        FROM studyrights S, educations E 
        WHERE S.person_id = P.id AND S.education_id = E.id 
        AND E.education_type IN (:validEducations)
        AND TO_DATE(valid->>'endDate', 'YYYY-MM-DD') >= NOW()
        AND TO_DATE(valid->>'startDate', 'YYYY-MM-DD') <= NOW()
        AND S.snapshot_date_time <= NOW()
        LIMIT 1
    ) > 0 has_study_right
    FROM persons P;
    
  CREATE INDEX person_study_rights_view_index ON person_study_rights_view (person_id)
  `,
    {
      replacements: {
        validEducations
      }
    }
  )

  updateCreatedAt()
  state = 'idle'
}

const refreshPersonStudyRightsView = async () => {
  state = 'refreshing'
  console.log('Refreshing person study rights view...')
  await sequelize.query(`
    REFRESH MATERIALIZED VIEW person_study_rights_view;
  `)
  updateCreatedAt()
  state = 'idle'
}

/**
 * Refresh person_study_rights_view if it is old
 * @returns {boolean} true if view is refreshing or started to refresh
 */
const isRefreshingPersonStudyRightsView = () => {
  if (state !== 'idle') return true

  if (!createdAt) {
    createPersonStudyRightsView()
    return true
  }

  if (isExpired()) {
    refreshPersonStudyRightsView()
    return true
  }

  return false
}

module.exports = {
  createPersonStudyRightsView,
  isRefreshingPersonStudyRightsView
}
