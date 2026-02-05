const express = require("express");
const router = express.Router();

const {createAssessment, getAllAssessments, getAssessmentById} = require("../controllers/assessmentController");

router.post("/assessments", createAssessment);
router.get("/assessments", getAllAssessments);
router.get("/assessments/:id", getAssessmentById);

module.exports = router;