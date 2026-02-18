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
 * Helper: Calculate gaps from an assessment object
 */
const calculateGapsForAssessment = async (assessment) => {
  console.log("--> calculateGapsForAssessment Triggered for Assessment ID:", assessment._id);
  const facultyId = assessment.facultyId;
  const gaps = [];

  try {
    // Loop through assessed skills
    for (const rating of assessment.skillRatings) {
      const { skillId, hodRating } = rating;

      // Fetch required rating
      const mapping = await SkillMapping.findOne({ skillId });

      if (!mapping) {
        console.warn(`No mapping found for skillId: ${skillId}`);
        continue;
      }

      const currentRating = hodRating || 0; // Use HOD rating
      const requiredRating = mapping.requiredRating;

      const gapScore = Math.max(requiredRating - currentRating, 0);

      let gapSeverity = "low";
      if (gapScore >= 3) gapSeverity = "high";
      else if (gapScore >= 1) gapSeverity = "medium";

      // -------------------------------------------------------------
      // DECISION: Store ALL records or only where Gap > 0?
      // -------------------------------------------------------------
      // If the user wants to see "Standard Met" in the gap report too, we should store 0 gaps.
      // But usually "Skill Gap" implies a deficiency.
      // Current Logic: Only store if gapScore > 0
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

    console.log(`--> Calculated ${gaps.length} gaps. Updating SkillGap collection...`);

    // Update or Create SkillGap record
    const result = await SkillGap.findOneAndUpdate(
      { assessmentId: assessment._id },
      {
        facultyId,
        assessmentId: assessment._id,
        gaps,
        totalGaps: gaps.length,
      },
      { upsert: true, new: true }
    );

    console.log("--> SkillGap Updated Successfully:", result._id);
    return result;
  } catch (error) {
    console.error("--> Error in calculateGapsForAssessment:", error);
    throw error;
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

    // 2️⃣ Use the helper function
    const skillGap = await calculateGapsForAssessment(assessment);

    res.status(201).json({
      message: "Skill gap calculated successfully",
      skillGap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EXPORT BOTH FUNCTIONS (IMPORTANT)
/**
 * @desc   Fetch skill gap for a specific faculty
 * @route  GET /api/skillgaps/:facultyId
 */
const getSkillGapForFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const skillGap = await SkillGap.findOne({ facultyId })
      .populate("facultyId", "name email")
      .populate("gaps.skillId", "name category requiredRating"); // Populate requiredRating if needed

    if (!skillGap) {
      return res.status(404).json({ message: "No skill gap record found for this faculty." });
    }

    res.status(200).json(skillGap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateSkillGap,
  getAllSkillGaps,
  calculateGapsForAssessment,
  getSkillGapForFaculty,
};
