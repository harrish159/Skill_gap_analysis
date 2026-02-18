const SkillGap = require("../schemas/SkillGapSchema");
const Training = require("../schemas/TrainingSchema");
const ApprovalRequest = require("../schemas/ApprovalSchema");

exports.getTrainingRecommendations = async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Get latest skill gap
    const skillGap = await SkillGap.findOne({ facultyId })
      .populate("gaps.skillId", "name category");

    if (!skillGap || skillGap.gaps.length === 0) {
      return res.status(200).json([]);
    }

    // Get all approval requests for this faculty
    const approvalRequests = await ApprovalRequest.find({ facultyId })
      .populate("requestedSkills.skillId")
      .sort({ createdAt: -1 }); // Most recent first

    // Create a map of skillId -> latest approval status and reason
    const statusMap = {};
    approvalRequests.forEach((request) => {
      request.requestedSkills.forEach((skill) => {
        const skillIdStr = skill.skillId.toString();
        // Since requests are sorted by createdAt: -1, the first one we see is the latest
        if (!statusMap[skillIdStr]) {
          statusMap[skillIdStr] = {
            status: request.status,
            reason: request.reason || ""
          };
        }
      });
    });

    // 4. Get all active training programs for matching skills
    const allTrainings = await Training.find({ isActive: true });

    // 5. Transform gaps into recommendation format with matching trainings
    const recommendations = skillGap.gaps.map((gap) => {
      const skillIdStr = gap.skillId._id.toString();
      const latestRequest = statusMap[skillIdStr] || {};

      // Find trainings that cover this skill
      const matchingTrainings = allTrainings.filter(t =>
        t.skillsCovered.some(sc => sc.skillId.toString() === skillIdStr)
      );

      return {
        skillId: gap.skillId._id,
        skillName: gap.skillId.name,
        category: gap.skillId.category,
        gap: gap.gapScore,
        currentRating: gap.currentRating,
        requiredLevel: gap.requiredRating,
        status: latestRequest.status || null,
        hodReason: latestRequest.reason || null,
        trainings: matchingTrainings.map(t => ({
          title: t.title,
          provider: t.provider,
          type: t.type,
          mode: t.mode,
          durationHours: t.durationHours
        }))
      };
    });

    console.log(`-> Returning ${recommendations.length} training recommendations for faculty ${facultyId}`);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching training recommendations:", error);
    res.status(500).json({ message: error.message });
  }
};
