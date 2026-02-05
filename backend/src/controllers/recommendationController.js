const SkillGap = require("../schemas/SkillGapSchema");
const Training = require("../schemas/TrainingSchema");

exports.getTrainingRecommendations = async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Get latest skill gap
    const skillGap = await SkillGap.findOne({ facultyId }).sort({
      createdAt: -1,
    });

    if (!skillGap) {
      return res.status(404).json({ message: "No skill gap found" });
    }

    const skillIds = skillGap.gaps.map((gap) => gap.skillId);

    // Find trainings covering those skills
    const trainings = await Training.find({
      skillsCovered: { $in: skillIds },
      isActive: true,
    });

    res.status(200).json({
      facultyId,
      recommendedTrainings: trainings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
