const _ = require('lodash')
const LRU = require('lru-cache')

class SisClient {
  constructor({ graphqlClient }) {
    this.graphqlClient = graphqlClient

    this.cache = new LRU({
      max: 20,
      maxAge: 1800000 // 30 minutes
    })
  }

  async getEnrolmentsByCourseUnitRealisationId(courseUnitRealisationId) {
    const cacheKey = `enrolments.${courseUnitRealisationId}`;

    const cacheData = this.cache.get(cacheKey);

    if (cacheData) {
      return cacheData;
    }

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
    const enrolments = _.get(result, 'data.course_unit_realisation.enrolments') || [];

    this.cache.set(cacheKey, enrolments);

    return enrolments;
  }
}

module.exports = SisClient
