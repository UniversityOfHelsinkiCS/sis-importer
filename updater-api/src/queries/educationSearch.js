const queryWrapper = require('../utils/queryWrapper')

/**
 * @param {Object} variables - Education search query variables
 * @param {string} [variables.fullTextQuery=""] - Full text query
 */
module.exports = variables =>
  queryWrapper(
    `
    query education_search($fullTextQuery: String) {
      education_search(fullTextQuery: $fullTextQuery) {
        name {
          fi
        }
        code
        organisations {
          organisation {
            name {
              fi
            }
          }
        }
        structure {
          phase1 {
            name {
              fi
            }
            options {
              degreeTitle {
                name {
                  fi
                }
              }
              moduleGroup {
                modules {
                  name {
                    fi
                  }
                  curriculumPeriods {
                    name {
                      fi
                    }
                    activePeriod {
                      endDate
                      startDate
                    }
                  }
                  responsibilityInfos {
                    person {
                      firstName
                    }
                  }
                }
              }
            }
          }
          learningOpportunities {
            name {
              en
            }
          }
        }
      }
    }
  `,
    variables
  )
