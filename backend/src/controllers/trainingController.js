const Training = require("../schemas/TrainingSchema");

/**
 * @desc   Add new training program
 * @route  POST /api/trainings
 */
exports.addTraining = async (req, res) => {
  try {
    const {
      title,
      description,
      provider,
      type,
      mode,
      durationHours,
      skillsCovered,
      targetProficiencyLevel,
    } = req.body;

    if (!skillsCovered || skillsCovered.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one skill must be covered" });
    }

    const training = await Training.create({
      title,
      description,
      provider,
      type,
      mode,
      durationHours,
      skillsCovered,
      targetProficiencyLevel,
    });

    res.status(201).json({
      message: "Training program added successfully",
      training,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get all training programs
 * @route  GET /api/trainings
 */
exports.getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({ isActive: true }).populate(
      "skillsCovered.skillId",
      "name category",
    );

    res.status(200).json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get trainings by skill + gapScore (RECOMMENDATION LOGIC)
 * @route  GET /api/trainings/recommend/:skillId/:gapScore
 */
exports.getTrainingBySkillAndGap = async (req, res) => {
  try {
    const { skillId, gapScore } = req.params;

    const trainings = await Training.find({
      isActive: true,
      "skillsCovered.skillId": skillId,
      "skillsCovered.minGapScore": { $lte: gapScore },
      $or: [
        { "skillsCovered.maxGapScore": { $gte: gapScore } },
        { "skillsCovered.maxGapScore": { $exists: false } },
      ],
    }).populate("skillsCovered.skillId", "name category");

    res.status(200).json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Delete training
 * @route  DELETE /api/trainings/:id
 */
exports.deleteTraining = async (req, res) => {
  try {
    await Training.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Training deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
