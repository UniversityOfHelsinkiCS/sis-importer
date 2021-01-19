const { Attainment } = require('../db/models')
const { bulkCreate, bulkDelete } = require('../utils/db')

const parseAttainment = attainment => {
  return {
    id: attainment.id,
    personId: attainment.personId,
    personStudentNumber: attainment.personStudentNumber,
    verifierPersonId: attainment.verifierPersonId,
    studyRightId: attainment.studyRightId,
    attainmentDate: attainment.attainmentDate,
    registrationDate: attainment.registrationDate,
    expiryDate: attainment.expiryDate,
    attainmentLanguageUrn: attainment.attainmentLanguageUrn,
    acceptorPersons: attainment.acceptorPersons,
    organisations: attainment.organisations,
    state: attainment.state,
    misregistration: attainment.misregistration,
    misregistrationRationale: attainment.misregistrationRationale,
    primary: attainment.primary,
    credits: attainment.credits,
    studyWeeks: attainment.studyWeeks,
    gradeScaleId: attainment.gradeScaleId,
    gradeId: attainment.gradeId,
    gradeAverage: attainment.gradeAverage,
    additionalInfo: attainment.additionalInfo,
    studyFieldUrn: attainment.studyFieldUrn,
    name: attainment.name,
    studyLevelUrn: attainment.studyLevelUrn,
    courseUnitTypeUrn: attainment.courseUnitTypeUrn,
    courseUnitId: attainment.courseUnitId,
    courseUnitRealisationId: attainment.courseUnitRealisationId,
    assessmentItemId: attainment.assessmentItemId,
    code: attainment.code,
    type: attainment.type,
    moduleId: attainment.moduleId,
    moduleGroupId: attainment.moduleGroupId,
    nodes: attainment.nodes
  }
}

module.exports = async ({ active, deleted }, transaction) => {
  await bulkCreate(Attainment, active.map(parseAttainment), transaction)
  await bulkDelete(Attainment, deleted, transaction)
}
