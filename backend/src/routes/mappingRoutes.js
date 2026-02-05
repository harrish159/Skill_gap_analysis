const express = require("express");
const router = express.Router();
const {
  addOrUpdateSkillMapping,
  getSkillMappings,
} = require("../controllers/mappingController");

router.post("/mappingSkill", addOrUpdateSkillMapping);
router.get("/mappingSkill", getSkillMappings);

module.exports = router;
