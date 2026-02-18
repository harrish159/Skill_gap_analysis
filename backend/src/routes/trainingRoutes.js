const express = require("express");
const router = express.Router();

const {
  addTraining,
  getAllTrainings,
  getTrainingBySkillAndGap,
  deleteTraining,
} = require("../controllers/trainingController");

const { createTrainingRequest } = require("../controllers/approvalController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/training", addTraining);
router.get("/training", getAllTrainings);
router.get("/training/recommend/:skillId/:gapScore", getTrainingBySkillAndGap);
router.delete("/training/:id", deleteTraining);

// Path: POST /api/training-request (Faculty only)
router.post("/training-request", protect, authorize("faculty"), createTrainingRequest);


module.exports = router;
