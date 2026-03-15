const Assessment = require("../schemas/AssessmentSchema");
const SkillGap = require("../schemas/SkillGapSchema");
const SkillMapping = require("../schemas/SkillMappingSchema");
const mongoose = require("mongoose");

/**
 * @desc   Fetch all skill gap records (HOD / Admin)
 * @route  GET /api/skillgaps
 */
const getAllSkillGaps = async (req, res) => {
  try {
    const filter = {};
    if (req.departmentId) {
      const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
      filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
    }

    const skillGaps = await SkillGap.find(filter)
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
      const { skillId, hodRating, comments } = rating;

      // Fetch skill to get targetScore
      const Skill = require("../schemas/SkillSchema");
      const skill = await Skill.findById(skillId);

      if (!skill) {
        console.warn(`No skill found for skillId: ${skillId}`);
        continue;
      }

      // Skip skills that haven't been assessed yet (null score)
      if (hodRating === null || hodRating === undefined) {
        console.log(`Skipping gap calc for Skill: ${skill.name} (Not yet assessed)`);
        continue;
      }

      const currentRating = hodRating; // Already 0-100
      const targetScore = skill.targetScore || 80;

      const gapScore = Math.max(targetScore - currentRating, 0);

      let gapSeverity = "low";
      if (gapScore > 30) gapSeverity = "high";
      else if (gapScore > 10) gapSeverity = "medium";

      // Store ALL records if needed, or just gaps
      // Requirement says: 0–10 -> Strong Skill, 11–30 -> Moderate, Above 30 -> High
      // I'll store all assessed skills so the dashboard can show "Strong Skill" statuses too.
      gaps.push({
        skillId,
        requiredRating: targetScore,
        currentRating,
        gapScore,
        gapSeverity,
        comments: comments || "",
      });
    }

    console.log(`--> Calculated ${gaps.length} gaps. Updating SkillGap collection...`);

    // Update or Create SkillGap record
    const result = await SkillGap.findOneAndUpdate(
      { assessmentId: assessment._id },
      {
        facultyId,
        departmentId: assessment.departmentId,
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
