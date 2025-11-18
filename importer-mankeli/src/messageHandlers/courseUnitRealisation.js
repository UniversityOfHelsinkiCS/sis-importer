const { CourseUnitRealisation } = require('../db/models')
const { bulkCreate } = require('../utils/db')

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
    enrolmentPeriod: courseUnitRealisation.enrolmentPeriod,
    responsibilityInfos: courseUnitRealisation.responsibilityInfos,
    customCodeUrns: courseUnitRealisation.customCodeUrns,
    documentState: courseUnitRealisation.documentState
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(CourseUnitRealisation, active.concat(deleted).map(parseCourseUnitRealisation), transaction)
}
