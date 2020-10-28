const axios = require('axios')
const fs = require('fs')
const https = require('https')

const { CERT_PATH, KEY_PATH, SIS_GRAPHQL_API_URL } = process.env

const agent = new https.Agent({
  cert: fs.readFileSync(CERT_PATH, 'utf8'),
  key: fs.readFileSync(KEY_PATH, 'utf8'),
})

const instance = axios.create({
  baseURL: SIS_GRAPHQL_API_URL,
})

instance.defaults.httpsAgent = agent

const sendRequest = async studentNumber => { 
  console.log('ASKING FOR ENROLMENTS FOR', studentNumber)
  return instance.post('/', {
    query: `query getPrivatePerson($id: ID!) {
      private_person_by_student_number(id: $id) {
        enrolments {
          courseUnitRealisation {
            activityPeriod {
              endDate
            }
          }
          courseUnit {
            code
            organisations {
              organisation {
                code
                name {
                  fi
                }
              }
            }
          }
        }
      }
    }`,
    variables: { id: studentNumber },
  })
}

module.exports = sendRequest
