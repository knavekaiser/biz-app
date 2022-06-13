const baseApiUrl = process.env.REACT_APP_HOST;

export default {
  baseApiUrl,
  locations: `${baseApiUrl}/location`,
  categories: `${baseApiUrl}/category`,
  subCategories: `${baseApiUrl}/subCategory`,
  reportables: `${baseApiUrl}/reportable`,
  contributingFactors: `${baseApiUrl}/contributingFactors`,
  contributingFactorDetails: `${baseApiUrl}/contributingFactorDetails`,
  twoFieldMasters: `${baseApiUrl}/twoFieldMaster`,
  twoFieldMasterDetails: `${baseApiUrl}/twoFieldMasterDetails`,
  users: `${baseApiUrl}/user`,
  searchUserByUsername: `${baseApiUrl}/user/search/findByUserName`,
  departments: `${baseApiUrl}/department`,
  riskAssessments: `${baseApiUrl}/riskAssement`,
  rcas: `${baseApiUrl}/rca`,
  personAffecteds: `${baseApiUrl}/personAffected`,
  personAffectedDetails: `${baseApiUrl}/personAffectedDetails`,
  rcaCauses: `${baseApiUrl}/rcaCauses`,
  userPermissions: `${baseApiUrl}/userPermission`,
  userPermission_updateByRole: `${baseApiUrl}/userPermission/search/updateByRole`,
  uploadFiles: `${baseApiUrl}/upload-multiple-files`,
  apiUrl: `${baseApiUrl}/apiurls`,
  token: `${baseApiUrl}/oauth/token`,

  incidentReport: `${baseApiUrl}/IncidentReport`,
  searchIrs: `${baseApiUrl}/IncidentReport/search/byDetails`,
  sequence: `${baseApiUrl}/sequence`,

  findUserByUsername: `${baseApiUrl}/user/search/findByUserName`,

  countStateDetailByStatus: `${baseApiUrl}/IrStatusDetailsCount/search/countByStatus`,
  countIrByStatusAndUserId: `${baseApiUrl}/IncidentReport/search/countByStatusAndUserId`,
  countIrByStatus: `${baseApiUrl}/IncidentReport/search/countByStatus`,

  countIrCurrentMonth: `${baseApiUrl}/IncidentReport/search/countCurrentMonth`,
  countIrByType: `${baseApiUrl}/IncidentReport/search/countByTypeofInci`,
  countIrByPatientComplaint: `${baseApiUrl}/IncidentReport/search/countByPatientYesOrNo`,
  countIrByUserId: `${baseApiUrl}/IncidentReport/search/countByUserId`,
  countIrByDepartment: `${baseApiUrl}/IncidentReport/search/countByDepartment`,
  countIrByTat: `${baseApiUrl}/irStatusDetails/search/countByDays`,

  typesOfIncident: `${baseApiUrl}/configTypeOfIncident`,
  configTat: `${baseApiUrl}/configAcceptableTAT`,
  dashboardElements: `${baseApiUrl}/dashboardElements`,
  hodApproval: `${baseApiUrl}/configHodapproval`,
  sentinelNotifications: `${baseApiUrl}/configSentineLEventNotification`,
  incidentClosureFields: `${baseApiUrl}/incidentClosureFields`,
  configirscreen: `${baseApiUrl}/configirscreen`,
  irInvestigationDetails: `${baseApiUrl}/irInvestigationDetails`,

  irHodAck: `${baseApiUrl}/irHodAck`,

  formTemplates: `https://his19-3-1sit.napierhealthcare.com/napier-componentbuilder/componentbuilder/formData/search`,
  templateData: `${baseApiUrl}/templateData`,

  irQuerySearch: `${baseApiUrl}/irQuerySearch`,

  investigationEvents: `${baseApiUrl}/events`,
  investigationNotes: `${baseApiUrl}/notes`,
  evidences: `${baseApiUrl}/inputEvidences`,
  evidenceSearch: `${baseApiUrl}/inputEvidences/search/findByIrId`,
  recordInputs: `${baseApiUrl}/recordInput`,
  requestInputs: `${baseApiUrl}/reqInput`,
  responseInputs: `${baseApiUrl}/responseIrInput`,
  irInvestigation: `${baseApiUrl}/irInvestigation`,
};
