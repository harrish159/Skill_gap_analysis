const express = require("express");
const router = express.Router();

const { calculateSkillGap } = require("../controllers/skillgapController");

router.post("/skillgaps", calculateSkillGap);

module.exports = router;