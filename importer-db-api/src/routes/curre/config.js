const relevantAttributes = {
  courseUnit: ['id', 'code', 'responsibilityInfos', 'completionMethods', 'name', 'validityPeriod'],
  courseUnitRealisation: [
    'id',
    'name',
    'nameSpecifier',
    'assessmentItemIds',
    'activityPeriod',
    'responsibilityInfos',
    'courseUnitRealisationTypeUrn',
    'flowState'
  ],
  assessmentItem: ['id', 'name', 'nameSpecifier', 'assessmentItemType', 'organisations', 'primaryCourseUnitGroupId'],
  enrolments: [
    'id',
    'state',
    'personId',
    'assessmentItemId',
    'courseUnitRealisationId',
    'courseUnitId',
    'confirmedStudySubGroupIds',
    'documentState'
  ],
  persons: ['id', 'eduPersonPrincipalName', 'preferredLanguageUrn']
}

const teacherUrns = [
  'urn:code:course-unit-realisation-responsibility-info-type:teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:responsible-teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:administrative-person'
]

const timeTillCourseStart = 6

module.exports = {
  relevantAttributes,
  teacherUrns,
  timeTillCourseStart
}
