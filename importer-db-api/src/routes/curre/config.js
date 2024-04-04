const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
  'urn:code:course-unit-realisation-type:teaching-participation-seminar',
  'urn:code:course-unit-realisation-type:independent-work-project',
  'urn:code:course-unit-realisation-type:teaching-participation-blended',
  'urn:code:course-unit-realisation-type:teaching-participation-contact',
  'urn:code:course-unit-realisation-type:teaching-participation-distance',
]

const relevantAttributes = {
  courseUnit: ['id', 'code', 'responsibilityInfos', 'completionMethods', 'name', 'validityPeriod'],
  courseUnitRealisation: ['id', 'name', 'nameSpecifier', 'assessmentItemIds', 'activityPeriod', 'responsibilityInfos', 'courseUnitRealisationTypeUrn', 'flowState'],
  assessmentItem: ['id', 'name', 'nameSpecifier', 'assessmentItemType', 'organisations', 'primaryCourseUnitGroupId'],
  enrolments: [
    'id',
    'state',
    'personId',
    'assessmentItemId',
    'courseUnitRealisationId',
    'courseUnitId',
    'confirmedStudySubGroupIds',
    'documentState',
  ],
  persons: ['id', 'edu_person_principal_name', 'preferred_language_urn'],
}

const teacherUrns = [
  'urn:code:course-unit-realisation-responsibility-info-type:teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:responsible-teacher',
  'urn:code:course-unit-realisation-responsibility-info-type:administrative-person',
]

const timeTillCourseStart = 6

module.exports = {
  validRealisationTypes,
  relevantAttributes,
  teacherUrns,
  timeTillCourseStart,
}
