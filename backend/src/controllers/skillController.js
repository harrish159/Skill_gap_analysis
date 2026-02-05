const Skill = require("../schemas/SkillSchema");

const addSkill = async (req, res) => {
  try {
    const { name, category, description, createdBy } = req.body;

    const newSkill = new Skill({
      name,
      category,
      description,
      createdBy,
    });

    console.log(req.body);


    await newSkill.save();

    res.status(201).json({
      message: "Skill added successfully",
      skill: newSkill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSkill = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addSkill, getSkill };
