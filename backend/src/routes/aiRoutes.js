const express = require("express");
const router = express.Router();
const { generateMCQs } = require("../controllers/aiController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Post request to generate MCQs for a skill
router.post("/generate-test", protect, authorize("faculty", "hod", "admin"), generateMCQs);

module.exports = router;
