const { CourseUnitRealisation } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseCourseUnitRealisation = courseUnitRealisation => {
  return {
    id: courseUnitRealisation.id,
    universityOrgIds: courseUnitRealisation.universityOrgIds,
    flowState: courseUnitRealisation.flowState,
    name: courseUnitRealisation.name,
    nameSpecifier: courseUnitRealisation.nameSpecifier,
    assessmentItemIds: courseUnitRealisation.assessmentItemIds,
    activityPeriod: courseUnitRealisation.activityPeriod,
    teachingLanguageUrn: courseUnitRealisation.teachingLanguageUrn,
    courseUnitRealisationTypeUrn: courseUnitRealisation.courseUnitRealisationTypeUrn,
    studyGroupSets: courseUnitRealisation.studyGroupSets,
    organisations: courseUnitRealisation.organisations,
    enrolmentPeriod: courseUnitRealisation.enrolmentPeriod
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(CourseUnitRealisation, active.map(parseCourseUnitRealisation), transaction)
  await bulkDelete(CourseUnitRealisation, deleted, transaction)
}
