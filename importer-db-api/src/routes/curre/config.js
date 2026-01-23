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
  persons: [
    'id',
    'eduPersonPrincipalName',
    'preferredLanguageUrn',
    'studentNumber',
    'firstNames',
    'lastName',
    'primaryEmail'
  ]
}

const teacherUrns = [
  'urn:code:course-unit-realisation-responsibility-info-type:teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:responsible-teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:administrative-person'
]

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
  'urn:code:course-unit-realisation-type:teaching-participation-seminar',
  'urn:code:course-unit-realisation-type:independent-work-project', // ship these independent course things to the norppa side even if they arent widely used
  'urn:code:course-unit-realisation-type:independent-work-essay',
  'urn:code:course-unit-realisation-type:teaching-participation-blended',
  'urn:code:course-unit-realisation-type:teaching-participation-contact',
  'urn:code:course-unit-realisation-type:teaching-participation-distance',
  'urn:code:course-unit-realisation-type:training-training'
]

const timeTillCourseStart = 6

module.exports = {
  relevantAttributes,
  teacherUrns,
  timeTillCourseStart,
  validRealisationTypes
}
