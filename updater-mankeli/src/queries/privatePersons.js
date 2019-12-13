const { queryWrapper } = require('../utils/graphql')

/**
 * @param {Object} variables - PrivatePerson query variables
 * @param {string} [variables.ids=[]] - Array of PrivatePerson ids
 */
module.exports = variables =>
  queryWrapper(
    `
    query private_persons($ids: [String!]!) {
      private_persons(ids: $ids) {
        id
        primaryAddress {
          country {
            name {
              fi
              en
              sv
            }
          }
        }
        genderUrn
      }
    }
  `,
    variables
  )
