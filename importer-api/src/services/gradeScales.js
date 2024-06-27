const { APIS } = require('../config')
const { GRAPHQL_GRADE_SCALES_CHANNEL } = require('../utils/stan')
const { koriRequest } = require('../utils/koriApi')
const GRAPHQL_GRADE_SCALES_SCHEDULE_ID = 'GRAPHQL_GRADE_SCALES'

const info = {
  API: APIS.graphql,
  CHANNEL: GRAPHQL_GRADE_SCALES_CHANNEL,
  REDIS_KEY: GRAPHQL_GRADE_SCALES_SCHEDULE_ID,
  ONETIME: true,
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

const toExportResponseFormat = data => ({
  greatestOrdinal: 1,
  hasMore: false,
  entities: data
})

const customRequest = async () => {
  const gradeScalesData = await koriRequest('/grade-scales')
  return toExportResponseFormat(gradeScalesData)
}

const info_fd = {
  API: APIS.custom,
  CHANNEL: GRAPHQL_GRADE_SCALES_CHANNEL,
  REDIS_KEY: GRAPHQL_GRADE_SCALES_SCHEDULE_ID,
  ONETIME: true,
  customRequest
}

module.exports = {
  GRAPHQL_GRADE_SCALES_SCHEDULE_ID,
  info,
  info_fd
}
