const express = require("express");
const router = express.Router();

const {
  addTraining,
  getAllTrainings,
  getTrainingBySkillAndGap,
  deleteTraining,
} = require("../controllers/trainingController");

router.post("/training", addTraining);
router.get("/training", getAllTrainings);
router.get("/training/recommend/:skillId/:gapScore", getTrainingBySkillAndGap);
router.delete("/training/:id", deleteTraining);


module.exports = router;
