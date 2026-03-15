const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");
const restrictToDepartment = require("../middleware/restrictToDepartment");

// Path: GET /api/assessments (HOD/Admin only for stats)
router.get("/", protect, authorize("hod", "admin"), assessmentController.getAllAssessments);

// Path: GET /api/assessments/faculty/:facultyId (Faculty can view own, HOD can view all)
// Note: More granular check needed inside controller if we want strict owner check, 
// but for now, allowing both roles to access is a good start.
router.get("/faculty/:facultyId", protect, restrictToDepartment, authorize("hod", "faculty", "admin"), assessmentController.getAssessmentForFaculty);

// Path: POST /api/assessments/save (HOD or Faculty submitting MCQ)
router.post("/save", protect, restrictToDepartment, authorize("hod", "faculty", "admin"), assessmentController.saveAssessment);

// Path: POST /api/assessments/reset (HOD/Admin allowing a test retake by clearing score)
router.post("/reset", protect, restrictToDepartment, authorize("hod", "admin"), assessmentController.resetAssessmentRating);

// Path: POST /api/assessments/request-retake (Faculty requesting a test retake)
router.post("/request-retake", protect, authorize("faculty"), assessmentController.requestRetake);

// Path: GET /api/assessments/history (HOD/Admin viewing all attempts history)
router.get("/history", protect, restrictToDepartment, authorize("hod", "admin"), assessmentController.getAssessmentHistory);

// Path: GET /api/assessments/pending-retakes (HOD querying requested retakes)
router.get("/pending-retakes", protect, restrictToDepartment, authorize("hod", "admin"), assessmentController.getPendingRetakes);

// Path: POST /api/assessments/reject-retake (HOD rejecting a retake request)
router.post("/reject-retake", protect, restrictToDepartment, authorize("hod", "admin"), assessmentController.rejectRetake);

module.exports = router;
