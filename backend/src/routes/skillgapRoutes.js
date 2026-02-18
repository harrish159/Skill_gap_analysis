const express = require("express");
const router = express.Router();

const {
  calculateSkillGap,
  getAllSkillGaps,
  getSkillGapForFaculty,
} = require("../controllers/skillgapController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Path: POST /api/skillgaps (HOD/Admin only)
router.post("/skillgaps", protect, authorize("hod", "admin"), calculateSkillGap);

// Path: GET /api/skillgaps (HOD/Admin only - get all gaps)
router.get("/skillgaps", protect, authorize("hod", "admin"), getAllSkillGaps);

// Path: GET /api/skillgaps/:facultyId (Faculty can view own, HOD/Admin can view all)
router.get("/skillgaps/:facultyId", protect, authorize("hod", "faculty", "admin"), getSkillGapForFaculty);

module.exports = router;