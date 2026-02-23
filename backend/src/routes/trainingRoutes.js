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
const restrictToDepartment = require("../middleware/restrictToDepartment");

router.post("/training", protect, authorize("hod", "admin"), restrictToDepartment, addTraining);
router.get("/training", protect, authorize("hod", "faculty", "admin"), restrictToDepartment, getAllTrainings);
router.get("/training/recommend/:skillId/:gapScore", protect, authorize("hod", "faculty", "admin"), restrictToDepartment, getTrainingBySkillAndGap);
router.delete("/training/:id", protect, authorize("hod", "admin"), restrictToDepartment, deleteTraining);

// Path: POST /api/training-request (Faculty only)
router.post("/training-request", protect, authorize("faculty"), restrictToDepartment, createTrainingRequest);


module.exports = router;
