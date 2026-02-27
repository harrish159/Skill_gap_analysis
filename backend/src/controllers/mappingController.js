const SkillMapping = require("../schemas/SkillMappingSchema");
const mongoose = require("mongoose");

/**
 * POST: Add or update required skill rating
 * (Admin / HOD)
 */
exports.addOrUpdateSkillMapping = async (req, res) => {
  try {
    const { skillId, requiredRating } = req.body;
    const effectiveDeptId = req.departmentId || req.body.departmentId;

    if (!skillId || !requiredRating || !effectiveDeptId) {
      return res.status(400).json({ message: "Missing fields: skillId, requiredRating, or departmentId" });
    }

    const deptIdStr = effectiveDeptId._id ? effectiveDeptId._id.toString() : effectiveDeptId.toString();
    const deptObjectId = new mongoose.Types.ObjectId(deptIdStr);

    const mapping = await SkillMapping.findOneAndUpdate(
      { skillId, departmentId: deptObjectId },
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
    const filter = {};
    if (req.departmentId) {
      const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
      filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
    }
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
    const filter = { _id: id };
    if (req.departmentId) {
      const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
      filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
    }

    const result = await SkillMapping.findOneAndDelete(filter);

    if (!result) {
      return res.status(404).json({ message: "Mapping not found or unauthorized" });
    }

    res.status(200).json({ message: "Mapping deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
