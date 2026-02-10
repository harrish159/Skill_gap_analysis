const express = require("express");
const router = express.Router();

const {
  calculateSkillGap,
  getAllSkillGaps,
} = require("../controllers/skillgapController");

router.post("/skillgaps", calculateSkillGap);
router.get("/skillgaps", getAllSkillGaps);

module.exports = router;