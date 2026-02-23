const express = require("express");
const router = express.Router();
const {
  addOrUpdateSkillMapping,
  getSkillMappings,
  deleteSkillMapping,
} = require("../controllers/mappingController");

const protect = require("../middleware/authmiddleware");
const restrictToDepartment = require("../middleware/restrictToDepartment");

router.post("/mappingSkill", protect, restrictToDepartment, addOrUpdateSkillMapping);
router.get("/mappingSkill", protect, restrictToDepartment, getSkillMappings);
router.delete("/mappingSkill/:id", protect, restrictToDepartment, deleteSkillMapping);

module.exports = router;
