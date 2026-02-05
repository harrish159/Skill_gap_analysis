const express = require("express");
const router = express.Router();

const {getTrainingRecommendations} = require("../controllers/recommendationController");

router.get("/training/recommend/:facultyId", getTrainingRecommendations);

module.exports = router;
