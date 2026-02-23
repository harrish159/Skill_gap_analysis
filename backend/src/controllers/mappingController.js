const SkillMapping = require("../schemas/SkillMappingSchema");

/**
 * POST: Add or update required skill rating
 * (Admin / HOD)
 */
exports.addOrUpdateSkillMapping = async (req, res) => {
  try {
    const { skillId, requiredRating } = req.body;
    const departmentId = req.departmentId || req.body.departmentId;

    if (!skillId || !requiredRating || !departmentId) {
      return res.status(400).json({ message: "Missing fields: skillId, requiredRating, or departmentId" });
    }

    const mapping = await SkillMapping.findOneAndUpdate(
      { skillId, departmentId },
      { requiredRating, facultyId: req.user.id }, // HOD is usually the facultyId in this context or it represents the mapper
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
    const filter = req.departmentId ? { departmentId: req.departmentId } : {};
    const mappings = await SkillMapping.find(filter).populate("skillId");
    res.status(200).json(mappings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * DELETE: Remove a skill mapping
 */
exports.deleteSkillMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = req.departmentId ? { _id: id, departmentId: req.departmentId } : { _id: id };

    const result = await SkillMapping.findOneAndDelete(filter);

    if (!result) {
      return res.status(404).json({ message: "Mapping not found or unauthorized" });
    }

    res.status(200).json({ message: "Mapping deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
