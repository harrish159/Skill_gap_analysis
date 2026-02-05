const express = require("express");
const router = express.Router();
const { addSkill, getSkill } = require("../controllers/skillController");

router.post("/skills", addSkill);
router.get("/skills", getSkill);

module.exports = router;
