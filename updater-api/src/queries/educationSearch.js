const { request } = require('../utils/api')

module.exports = async fullTextQuery => {
  return await request(`
    {
      education_search(fullTextQuery: "${fullTextQuery}") {
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
  `)
}
