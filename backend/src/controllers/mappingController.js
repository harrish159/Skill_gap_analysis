const SkillMapping = require("../schemas/SkillMappingSchema");

/**
 * POST: Add or update required skill rating
 * (Admin / HOD)
 */
exports.addOrUpdateSkillMapping = async (req, res) => {
  try {
    const { skillId, requiredRating } = req.body;

    if (!skillId || !requiredRating) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const mapping = await SkillMapping.findOneAndUpdate(
      { skillId },
      { requiredRating },
      { upsert: true, new: true },
    );

    res.status(200).json(mapping);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET: Get all required skill mappings
 */
exports.getSkillMappings = async (req, res) => {
  try {
    const mappings = await SkillMapping.find().populate("skillId");
    res.status(200).json(mappings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
