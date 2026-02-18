const express = require("express");
const router = express.Router();

const { getTrainingRecommendations } = require("../controllers/recommendationController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Path: GET /api/training/recommend/:facultyId (Faculty can view own, HOD/Admin can view all)
router.get("/training/recommend/:facultyId", protect, authorize("hod", "faculty", "admin"), getTrainingRecommendations);

module.exports = router;
