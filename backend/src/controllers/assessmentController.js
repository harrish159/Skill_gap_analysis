const Assessment = require("../schemas/AssessmentSchema");
const SkillMapping = require("../schemas/SkillMappingSchema");
const User = require("../schemas/UserSchema");
const mongoose = require("mongoose");

exports.getAssessmentForFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const departmentId = req.departmentId; // Injected by restrictToDepartment

    // 1. Fetch Skill Mappings for this department
    const filter = {};
    if (departmentId) {
      const deptIdStr = departmentId._id ? departmentId._id.toString() : departmentId.toString();
      filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
    }
    const mappings = await SkillMapping.find(filter)
      .populate("skillId", "name category description")
      .lean();

    // 2. Fetch existing Assessment for this faculty
    const assessment = await Assessment.findOne({ facultyId }).lean();
    // ... (rest of logic remains same, but using department-specific mappings)

    // Create a lookup for existing ratings if they exist
    const ratingLookup = {};
    if (assessment) {
      assessment.skillRatings.forEach((r) => {
        if (r.skillId) ratingLookup[r.skillId.toString()] = {
          hodRating: r.hodRating,
          gap: r.gap
        };
      });
    }

    // 3. Construct the merged skill ratings list
    // This ensures that even for a "new" assessment, the HOD sees all the skills that need evaluation.
    const formattedRatings = mappings.map((m) => {
      if (!m.skillId) return null;
      const skillIdStr = m.skillId._id.toString();
      const existing = ratingLookup[skillIdStr] || {};

      return {
        skillId: m.skillId, // populated skill object
        hodRating: existing.hodRating || 0,
        gap: existing.gap !== undefined ? existing.gap : null,
        requiredRating: m.requiredRating
      };
    }).filter(r => r !== null);

    console.log(`--> Returning ${formattedRatings.length} skills (Merged with Master Mappings)`);

    // 4. Get faculty details
    const faculty = await User.findById(facultyId).select("name email role departmentId").lean();

    res.status(200).json({
      facultyId: faculty,
      skillRatings: formattedRatings,
      status: assessment ? assessment.status : "new",
      isNew: !assessment,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const { calculateGapsForAssessment } = require("./skillgapController");

exports.saveAssessment = async (req, res) => {
  try {
    const { facultyId, ratings } = req.body; // ratings: [{ skillId, hodRating }]

    // 1. Fetch all required ratings to calculate gaps
    const skillIds = ratings.map((r) => r.skillId);
    const mappings = await SkillMapping.find({ skillId: { $in: skillIds } });

    // Create a lookup for required ratings
    const requiredLookup = {};
    mappings.forEach((m) => {
      requiredLookup[m.skillId.toString()] = m.requiredRating;
    });

    // 2. Prepare ratings with calculated gaps
    const ratingsWithGaps = ratings.map((r) => {
      const required = requiredLookup[r.skillId] || 0;
      const gap = (r.hodRating || 0) - required;
      return {
        skillId: r.skillId,
        hodRating: r.hodRating,
        gap: gap,
      };
    });

    const effectiveDeptId = req.departmentId || req.body.departmentId;
    const deptObjectId = effectiveDeptId ? new mongoose.Types.ObjectId(effectiveDeptId._id ? effectiveDeptId._id.toString() : effectiveDeptId.toString()) : null;

    const assessment = await Assessment.findOneAndUpdate(
      { facultyId },
      {
        facultyId,
        departmentId: deptObjectId,
        skillRatings: ratingsWithGaps,
        status: "reviewed",
        reviewedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true },
    );

    // 3. Update SkillGap Collection (Sync)
    await calculateGapsForAssessment(assessment);

    res
      .status(200)
      .json({ message: "Data stored in Assessment table and SkillGap updated", assessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllAssessments = async (req, res) => {
  try {
    const filter = {};
    if (req.departmentId) {
      const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
      filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
    }
    const assessments = await Assessment.find(filter).populate("facultyId", "name email");
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
