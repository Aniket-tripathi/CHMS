const express = require("express");
const router = express.Router();
const userControllers = require("../Controller/userControllers.js");
const countersController = require("../Controller/counterControllers.js");
const clinicsController = require("../Controller/clinicControllers.js");
const desgController = require("../Controller/desgControllers.js");
const deptontroller = require("../Controller/deptControllers.js");
const staffController = require("../Controller/staffController.js")
const roleControllers = require("../Controller/roleControllers.js")
const countryControllers = require("../Controller/countryControllers.js")
const provinceControllers = require("../Controller/provinceControllers.js")
const districtControllers = require("../Controller/districtControllers.js")
const subDstControllers = require("../Controller/subDstControllers.js")
const levelControllers = require("../Controller/levelControllers.js")
const superadminontroller = require("../Controller/superadminControllers.js")
const visitController = require("../Controller/visitControllers.js")
const patientController = require("../Controller/patientController.js")
const AppointmentReasonControllers = require("../Controller/AppointmentReasonControllers.js")
const clinicScheduleController = require("../Controller/clinicScheduleControllers.js")
const vitalController = require("../Controller/vitalControllers.js")
const regionControllers = require("../Controller/regionControllers.js")
const wardControllers = require("../Controller/wardControllers.js")
const ClassificationController = require("../Controller/ClassificationController.js")
const appointmentController = require("../Controller/AppointmentControllers.js");
const auditTrialController = require("../Controller/auditTrialControllers.js");
const TokenControllers = require("../Controller/TokenControllers.js")

// User Router
router.post('/user', userControllers.insertUser);

router.get('/user', userControllers.getUser);

router.get('/user/:id', userControllers.getUserById);

router.put('/user/:id', userControllers.updateUser);

router.delete('/user/:id', userControllers.deleteUser);

// Counter Router

router.post('/counter', countersController.insertCounter);

router.get('/counter', countersController.getCounter);

router.get('/counter/:id', countersController.getCounterById);

router.get('/getPharmacycounter', clinicsController.getPharmacycounter);

router.get('/counterbyclinic/:id', countersController.getCounterByClinic);

router.put('/counter/:id', countersController.updateCounter);

router.delete('/counter/:id', countersController.deleteCounter);

router.get('/CheckCounterByClinic/:id', countersController.CheckCounterByClinic)

// Clinic Router
router.post('/clinic', clinicsController.upload, clinicsController.insertClinic);

router.get('/clinic', clinicsController.getClinic);

router.get('/getCliniccounter', clinicsController.getCliniccounter);

router.post('/check-email', clinicsController.checkEmailAvailability);

router.get('/clinic/:clinicid', clinicsController.getClinicById);

router.put('/clinic/:clinicid', clinicsController.updateClinic);

router.delete('/clinic/:clinicid', clinicsController.deleteClinic);

router.put('/clinic/:clinicid/status', clinicsController.toggleClinicStatus);

router.get('/count', clinicsController.getTotalClinicsCount);

router.get('/clinicLogo/:filename', clinicsController.getClinicLogo);



// Designation Router

router.post("/designation", desgController.insertDesg);

router.get("/designation/:id", desgController.getDesgById);

router.put("/designation/:id", desgController.updateDesg);

router.delete("/designation/:id", desgController.deleteDesg);

router.get("/designations", desgController.getdesignations);

// Department Router

router.post("/department", deptontroller.insertDept);

router.get("/department/:id", deptontroller.getDeptById);

router.put("/department/:id", deptontroller.updateDept);

router.delete("/department/:id", deptontroller.deleteDept);

router.get("/department", deptontroller.getd);


// Staff
router.post('/staff', staffController.insertStaff);

router.get('/staff', staffController.getstaff);

router.post('/staff-email', staffController.checkEmailAvailabilitystaff);

router.get('/countstaff', staffController.getTotalStaffCount);

router.put('/staff/:staffid/status', staffController.togglestaffStatus);

router.get('/staff/:id', staffController.getstaffById);
// Role Router

router.post("/insertrole", roleControllers.insertRole);

router.get("/clinicrole/:clinic_id", roleControllers.getclinicroles);

router.get("/role/:rid", roleControllers.getRoleById);

router.put("/role/:id", roleControllers.updateRole);

router.delete("/role/:id", roleControllers.deleterole);

router.get("/roles", roleControllers.getroles);


// country
router.get('/country', countryControllers.getCountry);

// province
// router.get('/province', provinceControllers.getProvince);

// district
router.get('/district', districtControllers.getDistrict);

// subDistrict
router.get('/subDistrict', subDstControllers.getSubDistrict);

// level
router.get('/level', levelControllers.getLevel);

// Super admin Login Api
router.post('/login', superadminontroller.login);


// Visit Registration 
router.post('/visit', visitController.vstregister);

router.get('/visit', visitController.getVisit);

router.get('/visit/:id', visitController.getVisitById);

router.get('/visitbyclinic/:id', visitController.getVisitByClinic);

router.get('/vstpatient/:id', visitController.getptnById);

router.get('/getvisitdata/:id', visitController.getvisitdata);

// Patient Router

router.post('/patient', patientController.insertPatient);

router.get('/patient', patientController.getPatient);

router.get('/classificationByClinic/:clinicid', patientController.classificationByClinic);

router.get('/patient/:id', patientController.getPatientById);

router.get('/patientbyclinic/:clinicid', patientController.patientbyclinic);

router.get('/getmpino/:id', patientController.getmpino);

router.get('/patientsearch', patientController.getPatientdetails);

router.post('/saveSignature', patientController.saveSignature);

router.post('/saveWebcam', patientController.savewebcam);

router.get('/countpatient', patientController.getTotalPatientCount);



// Route to create a new appointment reason
router.post("/appointment-reasons", AppointmentReasonControllers.insertAppointmentReason
);

// Route to get all appointment reasons
router.get("/appointment-reasons", AppointmentReasonControllers.getAppointmentReasons
);

// Route to get a single appointment reason by ID
router.get("/appointment-reasons/:id", AppointmentReasonControllers.getAppointmentReasonById
);

// Route to update an appointment reason by ID
router.put("/appointment-reasons/:id", AppointmentReasonControllers.updateAppointmentReason
);

// Route to delete an appointment reason by ID
router.delete("/appointment-reasons/:id", AppointmentReasonControllers.deleteAppointmentReason
);


// Vital Route
router.post('/addvital', vitalController.insertVital);

router.get('/getvital/:id', vitalController.getVitalById);

router.get('/getvital', vitalController.getVital);

router.get('/bodytemp', vitalController.bodytemp);

router.get('/respiration', vitalController.respiration);

router.get('/pulserate', vitalController.pulserate);

router.get('/bloodPressure', vitalController.bloodPressure);

router.get('/bloodGlucose', vitalController.bloodGlucose);

router.get('/bodyWeight', vitalController.bodyWeight);

router.get('/calculateBMI', vitalController.calculateBMI);

router.get('/PeakFlow', vitalController.PeakFlow);

// Region Router

router.post("/insertregion", regionControllers.insertRegion);

router.get("/region", regionControllers.getregion);

router.put("/region/:id", regionControllers.updateRegion);

router.delete("/region/:id", regionControllers.deleteRegion);


// Ward Router

router.post("/insertward", wardControllers.insertWard);

router.get("/ward", wardControllers.getward);

router.put("/ward/:id", wardControllers.updateWard);

router.delete("/ward/:id", wardControllers.deleteWard);


//Add classification 
router.post('/classification', ClassificationController.upload, ClassificationController.insertclsifction);

router.get('/getclassification', ClassificationController.fetchclassification);

router.get('/classificationview/:id', ClassificationController.viewclassification)

router.get('/classificationclinic/:id', ClassificationController.classificationclinic);

router.put('/updateclassification/:id', ClassificationController.updateclsifiction);

router.delete('/deleteclassification/:id', ClassificationController.deleteclassification);


//Token Register
router.post('/token', TokenControllers.inserttoken);

router.get('/token', TokenControllers.tokendata);

router.get('/waitingtoken/:id', TokenControllers.Waitingtoken);

router.get('/gettoken/:id', TokenControllers.gettoken);

router.put('/completetoken/:id', TokenControllers.completetoken);

// insert AuditTrial
router.post('/audittrial', auditTrialController.insertAuditTrial);
router.get('/audittrial/:clinicId', auditTrialController.getAuditTrialByClinic);
router.get('/auditTrial', auditTrialController.getAllAuditTrial);

// Province

router.post("/insertprovince", provinceControllers.insertprovince);

router.get("/province", provinceControllers.getProvince);

router.put("/province/:id", provinceControllers.updateProvince);

router.delete("/province/:id", provinceControllers.deleteProvince);

// level

router.post("/insertlevel", levelControllers.insertlevel);

router.get("/level", levelControllers.getLevel);

router.put("/level/:id", levelControllers.updateLevel);

router.delete("/level/:id", levelControllers.deleteLevel);

//Add Clinic Schedule

router.post('/addschedule', clinicScheduleController.insertSchedule);

router.get('/getschedule', clinicScheduleController.getSchedule);


//GET sCHEDULE BY ID
router.get('/getschedule/:id', clinicScheduleController.getScheduleById);


//get schedule list by id for edit or display
router.get('/getschedulelist/:clinicid/:csid', clinicScheduleController.getSchedulelistbyid);


//get time slot clinic wise
router.get('/gettimeslot/:clinicid/:dates', clinicScheduleController.gettimeslot);

//get schedule wise reason
router.get(`/getScheduleReason/:clinic/:appdate/:timefrom/:timeto`, clinicScheduleController.getScheduleReason);

//count total schedules for pagination
router.get('/countschedulelist/:clinicid/:csid', clinicScheduleController.getTotalSchedulelistCount);



//Appointment Routes
router.post("/addappointments", appointmentController.insertAppointment);
router.get("/appointments", appointmentController.getAppointments);
router.get("/appointments/:id", appointmentController.getAppointmentById);
router.put("/appointments/:id", appointmentController.updateAppointment);
router.delete("/appointments/:id", appointmentController.deleteAppointment);

//count appointments
router.get('/totalappointmentcount', appointmentController.getTotalAppointmentsCount);

module.exports = router;