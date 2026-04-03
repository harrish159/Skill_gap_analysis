const express = require("express");
const router = express.Router();
const { addSkill, getSkill, updateSkill, deleteSkill } = require("../controllers/skillController");
const protect = require("../middleware/authmiddleware");
const restrictToDepartment = require("../middleware/restrictToDepartment");

router.post("/skills", protect, restrictToDepartment, addSkill);
router.get("/skills", protect, restrictToDepartment, getSkill);
router.put("/skills/:id", protect, restrictToDepartment, updateSkill);
router.delete("/skills/:id", protect, restrictToDepartment, deleteSkill);

module.exports = router;
