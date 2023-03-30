const relevantAttributes = {
  enrolment: [
    'id',
    'personId',
    'assessmentItemId',
    'courseUnitRealisationId',
    'courseUnitId',
    'studySubGroups',
    'confirmedStudySubGroupIds'
  ],
  courseUnit: [
    'id',
    'groupId',
    'code',
    'organisations',
    'completionMethods',
    'responsibilityInfos',
    'name',
    'validityPeriod',
  ],
  courseUnitRealisation: [
    'id',
    'flowState',
    'name',
    'nameSpecifier',
    'assessmentItemIds',
    'activityPeriod',
    'courseUnitRealisationTypeUrn',
    'studyGroupSets',
    'organisations',
    'responsibilityInfos',
    'customCodeUrns',
  ],
  assessmentItem: ['id', 'name', 'nameSpecifier', 'assessmentItemType', 'organisations', 'primaryCourseUnitGroupId'],
  person: [
    'id',
    'studentNumber',
    'employeeNumber',
    'eduPersonPrincipalName',
    'firstNames',
    'lastName',
    'callName',
    'primaryEmail',
    'secondaryEmail',
    'preferredLanguageUrn',
  ],
  organisation: ['id', 'code', 'name', 'parentId'],
}

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
  'urn:code:course-unit-realisation-type:teaching-participation-seminar',
  'urn:code:course-unit-realisation-type:independent-work-project', // ship these to the norppa side even if they arent widely used
]

const validEducations = [
  'urn:code:education-type:degree-education:lic',
  'urn:code:education-type:degree-education:bachelors-and-masters-degree',
  'urn:code:education-type:degree-education:specialisation-in-medicine-and-dentistry',
  'urn:code:education-type:degree-education:masters-degree',
  'urn:code:education-type:degree-education',
  'urn:code:education-type:degree-education:doctor',
  'urn:code:education-type:degree-education:bachelors-degree',
]

module.exports = {
  relevantAttributes,
  validRealisationTypes,
  validEducations,
}
