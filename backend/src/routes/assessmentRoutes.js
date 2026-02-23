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

// Path: POST /api/assessments/save (HOD only)
router.post("/save", protect, authorize("hod", "admin"), assessmentController.saveAssessment);

module.exports = router;
