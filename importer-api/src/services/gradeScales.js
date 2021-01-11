const { APIS } = require('../config')
const { GRAPHQL_GRADE_SCALES_CHANNEL } = require('../utils/stan')
const GRAPHQL_GRADE_SCALES_SCHEDULE_ID = 'GRAPHQL_GRADE_SCALES'

const info = {
  API: APIS.graphql,
  CHANNEL: GRAPHQL_GRADE_SCALES_CHANNEL,
  REDIS_KEY: GRAPHQL_GRADE_SCALES_SCHEDULE_ID,
  GRAPHQL_KEY: 'grade_scales',
  QUERY: `query {
    grade_scales {
      name {
        en
        fi
        sv
      }
      abbreviation {
        en
        fi
        sv
      }
      id
      grades {
        localId
        name {
          en
          fi
          sv
        }
        passed
        localId
        abbreviation {
          en
          fi
          sv
        }
        numericCorrespondence
      }
    }
  }`
}

module.exports = {
  GRAPHQL_GRADE_SCALES_SCHEDULE_ID,
  info
}
