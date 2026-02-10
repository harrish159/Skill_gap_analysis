const Assessment = require("../schemas/AssessmentSchema");
const SkillGap = require("../schemas/SkillGapSchema");
const SkillMapping = require("../schemas/SkillMappingSchema");

/**
 * @desc   Fetch all skill gap records (HOD / Admin)
 * @route  GET /api/skillgaps
 */
const getAllSkillGaps = async (req, res) => {
  try {
    const skillGaps = await SkillGap.find()
      .populate("facultyId", "name email role")
      .populate("assessmentId")
      .populate("gaps.skillId", "name category");

    res.status(200).json(skillGaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Calculate & store skill gap after faculty assessment
 * @route  POST /api/skillgaps
 */
const calculateSkillGap = async (req, res) => {
  try {
    const { assessmentId } = req.body;

    // 1️⃣ Fetch Assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const facultyId = assessment.facultyId;
    const gaps = [];

    // 2️⃣ Loop through assessed skills
    for (const rating of assessment.skillRatings) {
      const { skillId, selfRating } = rating;

      // Fetch required rating
      const mapping = await SkillMapping.findOne({ skillId });
      if (!mapping) continue;

      const currentRating = selfRating;
      const requiredRating = mapping.requiredRating;

      const gapScore = Math.max(requiredRating - currentRating, 0);

      let gapSeverity = "low";
      if (gapScore >= 3) gapSeverity = "high";
      else if (gapScore >= 1) gapSeverity = "medium";

      if (gapScore > 0) {
        gaps.push({
          skillId,
          requiredRating,
          currentRating,
          gapScore,
          gapSeverity,
        });
      }
    }

    // 3️⃣ Store Skill Gap (Schema-aligned)
    const skillGap = await SkillGap.create({
      facultyId,
      assessmentId,
      gaps,
      totalGaps: gaps.length,
    });

    res.status(201).json({
      message: "Skill gap calculated successfully",
      skillGap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EXPORT BOTH FUNCTIONS (IMPORTANT)
module.exports = {
  calculateSkillGap,
  getAllSkillGaps,
};
