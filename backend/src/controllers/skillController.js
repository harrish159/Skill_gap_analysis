const Skill = require("../schemas/SkillSchema");

const addSkill = async (req, res) => {
  try {
    const { name, category, description, proficiencyLevel, createdBy, targetScore, noOfMcqs } = req.body;
    const departmentId = req.departmentId || req.body.departmentId;

    const newSkill = new Skill({
      name,
      category,
      description,
      proficiencyLevel,
      createdBy,
      departmentId,
      targetScore,
      noOfMcqs,
    });

    await newSkill.save();
    res.status(201).json({ message: "Skill added successfully", skill: newSkill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSkill = async (req, res) => {
  try {
    const filter = req.departmentId ? { departmentId: req.departmentId } : {};
    const skills = await Skill.find(filter);
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addSkill, getSkill };
