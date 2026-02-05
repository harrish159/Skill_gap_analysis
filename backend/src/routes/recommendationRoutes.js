const express = require("express");
const router = express.Router();

const {getTrainingRecommendations} = require("../controllers/recommendationController");

router.get("/recommend/:facultyId", getTrainingRecommendations);

module.exports = router;
