const Assessment = require("../schemas/AssessmentSchema");

/**
 * Create / Submit Assessment
 * Faculty submits self-assessment
 */
exports.createAssessment = async (req, res) => {
  try {
    const { facultyId, skillRatings } = req.body;

    // Basic validation
    if (!facultyId || !skillRatings || skillRatings.length === 0) {
      return res
        .status(400)
        .json({ message: "facultyId and skillRatings are required" });
    }

    const assessment = await Assessment.create({
      facultyId,
      skillRatings,
      status: "submitted",
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: "Assessment submitted successfully",
      assessment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting assessment" });
  }
};

/**
 * Get all assessments
 */
exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate("facultyId", "name email role")
      .populate("skillRatings.skillId", "name category");

    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get assessment by ID
 */
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("facultyId", "name email")
      .populate("skillRatings.skillId", "name category");
      
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
