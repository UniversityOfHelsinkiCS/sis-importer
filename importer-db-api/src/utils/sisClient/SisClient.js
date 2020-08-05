const _ = require('lodash')
const LRU = require('lru-cache')

class SisClient {
  constructor({ graphqlClient }) {
    this.graphqlClient = graphqlClient

    this.cache = new LRU({
      max: 20,
      maxAge: 1800000, // 30 minutes
    })
  }

  async getWithCache(cacheKey, fn) {
    const cacheData = this.cache.get(cacheKey)

    if (cacheData) {
      return cacheData
    }

    const data = await fn()

    this.cache.set(cacheKey, data)

    return data
  }

  async getEnrolmentsByCourseUnitRealisationId(courseUnitRealisationId) {
    const cacheKey = `courseUnitRealisationEnrolments.${courseUnitRealisationId}`

    return this.getWithCache(cacheKey, async () => {
      const query = `
        query getCourseUnitRealisation($id: ID!) {
          course_unit_realisation(id: $id) {
            enrolments {
              id
            }
          }
        }
      `

      const result = await this.graphqlClient.query(query, { id: courseUnitRealisationId })
      const enrolments = _.get(result, 'data.course_unit_realisation.enrolments') || []

      return enrolments
    })
  }

  async getEnrolmentsByStudentNumber(studentNumber) {
    const cacheKey = `studentNumberEnrolments.${studentNumber}`

    return this.getWithCache(cacheKey, async () => {
      const query = `
        query getPrivatePerson($id: ID!) {
          private_person_by_student_number(id: $id) {
            enrolments {
              id
            }
          }
        }
      `

      const result = await this.graphqlClient.query(query, { id: studentNumber })
      const enrolments = _.get(result, 'data.private_person_by_student_number.enrolments') || []

      return enrolments
    })
  }
}

module.exports = SisClient
