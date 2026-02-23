const express = require("express");
const router = express.Router();
const { addSkill, getSkill } = require("../controllers/SkillController");
const protect = require("../middleware/authmiddleware");
const restrictToDepartment = require("../middleware/restrictToDepartment");

router.post("/skills", protect, restrictToDepartment, addSkill);
router.get("/skills", protect, restrictToDepartment, getSkill);

module.exports = router;
