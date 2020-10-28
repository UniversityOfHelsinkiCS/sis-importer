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
  httpsAgent: agent
})

const sendRequest = async studentNumber => { 
  console.log('ASKING FOR ENROLMENTS FOR', studentNumber)
  return instance.post("", {
    query: `{ private_person_by_student_number(id: \"${studentNumber}\") {
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
    }`
  })
}

module.exports = sendRequest
