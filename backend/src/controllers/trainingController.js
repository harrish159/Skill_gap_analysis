const Training = require("../schemas/TrainingSchema");
const mongoose = require("mongoose");

/**
 * @desc   Add new training program
 * @route  POST /api/trainings
 */
exports.addTraining = async (req, res) => {
  try {
    console.log("Adding training program, body:", req.body);
    const {
      title,
      description,
      provider,
      type,
      mode,
      durationHours,
      skillsCovered,
      targetProficiencyLevel,
      startDate,
      deadline,
      departmentId,
    } = req.body;

    if (!skillsCovered || !Array.isArray(skillsCovered) || skillsCovered.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one skill must be covered" });
    }

    // Use departmentId from body if provided (admin) or from req (hod)
    const effectiveDeptId = departmentId || req.departmentId;

    if (!effectiveDeptId && req.user.role !== 'ADMIN') {
      return res.status(400).json({ message: "Department ID is required" });
    }

    const deptObjectId = effectiveDeptId ? new mongoose.Types.ObjectId(effectiveDeptId) : null;

    let training = await Training.create({
      title,
      description,
      provider,
      type,
      mode,
      durationHours,
      skillsCovered,
      targetProficiencyLevel,
      startDate: startDate || undefined,
      deadline: deadline || undefined,
      departmentId: deptObjectId,
    });

    console.log("Training created, populating... ID:", training._id);

    // Populate skill info before sending back
    training = await Training.findById(training._id).populate(
      "skillsCovered.skillId",
      "name category"
    );

    res.status(201).json({
      message: "Training program added successfully",
      training,
    });
  } catch (error) {
    console.error("ADD TRAINING ERROR:", error);

    // Catch Mongoose specific errors to return 400 instead of 500
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid data provided: " + error.message,
        details: error.errors
      });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get all training programs
 * @route  GET /api/trainings
 */
exports.getAllTrainings = async (req, res) => {
  try {
    console.log("Fetching all trainings. Department filter:", req.departmentId);

    const filter = { isActive: true };
    if (req.departmentId) {
      // Robust check: if req.departmentId is already an object with _id, use that
      const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
      filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
    }

    console.log("Constructed Filter:", JSON.stringify(filter));

    const trainings = await Training.find(filter).populate(
      "skillsCovered.skillId",
      "name category",
    );

    console.log(`Found ${trainings.length} trainings`);
    if (trainings.length === 0) {
      const totalCount = await Training.countDocuments({});
      console.log(`Diagnostic: Total trainings in DB (unfiltered): ${totalCount}`);
    }
    res.status(200).json(trainings);
  } catch (error) {
    console.error("GET TRAININGS ERROR:", error);
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
    const gapScoreNum = Number(gapScore);

    // Normalize gapScore (0-100) to 1-5 scale for Training data compatibility
    const normalizedGap = Math.max((gapScoreNum / 100) * 5, 0.5);

    const filter = {
      isActive: true,
      "skillsCovered.skillId": skillId,
      "skillsCovered.minGapScore": { $lte: normalizedGap },
      $or: [
        { "skillsCovered.maxGapScore": { $gte: normalizedGap } },
        { "skillsCovered.maxGapScore": { $exists: false } },
        { "skillsCovered.maxGapScore": null }
      ],
    };

    if (req.departmentId) {
      const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
      filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
    }

    const trainings = await Training.find(filter).populate("skillsCovered.skillId", "name category");

    res.status(200).json(trainings);
  } catch (error) {
    console.error("RECOMMEND TRAINING ERROR:", error);
    res.status(500).json({ message: "Unable to Retrieve using GapScore" });
  }
};

/**
 * @desc   Delete training
 * @route  DELETE /api/trainings/:id
 */
exports.deleteTraining = async (req, res) => {
  try {
    console.log("Deleting training ID:", req.params.id);
    await Training.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Training deleted successfully" });
  } catch (error) {
    console.error("DELETE TRAINING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
