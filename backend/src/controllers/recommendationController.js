const SkillGap = require("../schemas/SkillGapSchema");
const Training = require("../schemas/TrainingSchema");
const ApprovalRequest = require("../schemas/ApprovalSchema");
const mongoose = require("mongoose");

exports.getTrainingRecommendations = async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Get latest skill gap
    const skillGap = await SkillGap.findOne({ facultyId })
      .populate("gaps.skillId", "name category")
      .populate("facultyId", "departmentId"); // Also fetch department from user as fallback

    if (!skillGap || skillGap.gaps.length === 0) {
      return res.status(200).json([]);
    }

    const deptIdRaw = skillGap.departmentId || skillGap.facultyId?.departmentId;
    const deptId = deptIdRaw ? new mongoose.Types.ObjectId(deptIdRaw._id ? deptIdRaw._id.toString() : deptIdRaw.toString()) : null;

    // Get all approval requests for this faculty
    const approvalRequests = await ApprovalRequest.find({ facultyId })
      .populate("requestedSkills.skillId")
      .sort({ createdAt: -1 }); // Most recent first

    // Create a map of skillId -> latest approval status and reason
    // AND a map of trainingId -> latest approval status and reason
    const skillStatusMap = {};
    const trainingStatusMap = {};

    approvalRequests.forEach((request) => {
      // 1. Map by trainingId if it exists
      if (request.trainingId) {
        const tIdStr = request.trainingId.toString();
        if (!trainingStatusMap[tIdStr]) {
          trainingStatusMap[tIdStr] = {
            status: request.status,
            reason: request.reason || ""
          };
        }
      }

      // 2. Map by skillId (for generic requests)
      request.requestedSkills.forEach((skill) => {
        const skillIdStr = skill.skillId.toString();
        if (!skillStatusMap[skillIdStr]) {
          skillStatusMap[skillIdStr] = {
            status: request.status,
            reason: request.reason || ""
          };
        }
      });
    });

    // 4. Get matching trainings for each gap
    const recommendations = await Promise.all(skillGap.gaps.map(async (gap) => {
      const skillIdStr = gap.skillId._id.toString();
      const latestSkillRequest = skillStatusMap[skillIdStr] || {};

      // Normalize gapScore (0-100) to 1-5 scale for backward compatibility with Training data
      const normalizedGap = Math.max((gap.gapScore / 100) * 5, 0.5); // Minimum 0.5 to catch low level trainings

      // Find trainings that cover this skill, match the gap score range, and belong to the same department
      const matchingTrainings = await Training.find({
        isActive: true,
        departmentId: deptId,
        skillsCovered: {
          $elemMatch: {
            skillId: gap.skillId._id,
            minGapScore: { $lte: normalizedGap },
            $or: [
              { maxGapScore: { $gte: normalizedGap } },
              { maxGapScore: { $exists: false } },
              { maxGapScore: null }
            ]
          }
        }
      });

      return {
        skillId: gap.skillId._id,
        skillName: gap.skillId.name,
        category: gap.skillId.category,
        gap: gap.gapScore,
        currentRating: gap.currentRating,
        requiredLevel: gap.requiredRating,
        status: latestSkillRequest.status || null,
        hodReason: latestSkillRequest.reason || null,
        trainings: matchingTrainings.map(t => {
          const skillCovered = t.skillsCovered.find(s => s.skillId.toString() === skillIdStr);
          const tIdStr = t._id.toString();
          const tRequest = trainingStatusMap[tIdStr] || {};

          return {
            _id: t._id,
            title: t.title,
            departmentId: t.departmentId,
            description: t.description,
            provider: t.provider,
            type: t.type,
            mode: t.mode,
            durationHours: t.durationHours,
            skillsCovered: t.skillsCovered,
            targetProficiencyLevel: t.targetProficiencyLevel,
            startDate: t.startDate,
            deadline: t.deadline,
            isActive: t.isActive,
            minGapScore: skillCovered?.minGapScore,
            maxGapScore: skillCovered?.maxGapScore,
            status: tRequest.status || null, // Specific training status
            hodReason: tRequest.reason || null
          };
        })
      };
    }));

    console.log(`-> Returning ${recommendations.length} training recommendations for faculty ${facultyId}`);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching training recommendations:", error);
    res.status(500).json({ message: error.message });
  }
};
