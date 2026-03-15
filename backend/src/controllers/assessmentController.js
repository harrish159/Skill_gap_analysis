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
    const Skill = require("../schemas/SkillSchema");
    const allSkills = await Skill.find({ isActive: true }).lean();

    const formattedRatings = allSkills.map((s) => {
      const skillIdStr = s._id.toString();
      const existing = ratingLookup[skillIdStr] || {};

      return {
        skillId: s, // populated skill object
        hodRating: existing.hodRating !== undefined ? existing.hodRating : null,
        gap: existing.gap !== undefined ? existing.gap : null,
        requiredRating: s.targetScore || 80
      };
    });

    console.log(`--> Returning ${formattedRatings.length} skills (Merged with Master Skills)`);

    // 4. Get faculty details
    const faculty = await User.findById(facultyId).select("name email role departmentId").lean();

    res.status(200).json({
      facultyId: faculty,
      skillRatings: formattedRatings,
      status: assessment ? assessment.status : "new",
      isNew: !assessment,
      retakeRequests: assessment ? assessment.retakeRequests : [],
      attemptsHistory: assessment ? assessment.attemptsHistory : []
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

    // Security check: Faculty can only save their own assessments
    if (req.user.role?.toLowerCase() === "faculty" && req.user.id !== facultyId) {
      return res.status(403).json({ message: "Access denied: You can only save your own assessment result" });
    }
    
    console.log(`Saving assessment for ${facultyId} by role ${req.user.role}`);

    // 1. Fetch all required scores to calculate gaps
    const skillIds = ratings.map((r) => r.skillId);
    const Skill = require("../schemas/SkillSchema");
    const skills = await Skill.find({ _id: { $in: skillIds } });

    // Create a lookup for target scores
    const targetLookup = {};
    skills.forEach((s) => {
      targetLookup[s._id.toString()] = s.targetScore || 80;
    });

    // 2. Prepare ratings with calculated gaps
    const ratingsWithGaps = ratings.map((r) => {
      const target = targetLookup[r.skillId] || 80;
      const gap = Math.max(target - (r.hodRating || 0), 0);
      return {
        skillId: r.skillId,
        hodRating: r.hodRating,
        gap: gap,
        comments: r.comments || "",
      };
    });

    const effectiveDeptId = req.departmentId || req.body.departmentId;
    const deptObjectId = effectiveDeptId ? new mongoose.Types.ObjectId(effectiveDeptId._id ? effectiveDeptId._id.toString() : effectiveDeptId.toString()) : null;

    // 3. Find existing or create new with merging
    let assessment = await Assessment.findOne({ facultyId });

    if (!assessment) {
      // Create new
      assessment = new Assessment({
        facultyId,
        departmentId: deptObjectId,
        skillRatings: ratingsWithGaps,
        status: "reviewed",
        reviewedAt: new Date(),
      });
    } else {
      // Merge: Update existing skill ratings or add new ones
      ratingsWithGaps.forEach(newRating => {
        const existingIndex = assessment.skillRatings.findIndex(
          sr => sr.skillId.toString() === newRating.skillId.toString()
        );

        if (existingIndex !== -1) {
          // Update existing
          assessment.skillRatings[existingIndex].hodRating = newRating.hodRating;
          assessment.skillRatings[existingIndex].gap = newRating.gap;
          assessment.skillRatings[existingIndex].comments = newRating.comments;
        } else {
          // Add new
          assessment.skillRatings.push(newRating);
        }
      });

      assessment.departmentId = deptObjectId || assessment.departmentId;
      assessment.status = "reviewed";
      assessment.reviewedAt = new Date();
    }

    // Append history for new attempts if missing
    if (!assessment.attemptsHistory) assessment.attemptsHistory = [];
    
    ratingsWithGaps.forEach(rating => {
        // Calculate the current attempt number for this skill
        const existingAttempts = assessment.attemptsHistory.filter(
            history => history.skillId.toString() === rating.skillId.toString()
        );
        const attemptNumber = existingAttempts.length + 1;

        // Push new attempt history
        assessment.attemptsHistory.push({
            skillId: rating.skillId,
            score: rating.hodRating,
            attemptNumber: attemptNumber,
            date: new Date()
        });

        // Also, if there was a retake request for this skill, mark it as completed or clear it
        if (assessment.retakeRequests) {
            assessment.retakeRequests = assessment.retakeRequests.filter(
                (req) => req.skillId.toString() !== rating.skillId.toString()
            );
        }
    });

    await assessment.save();

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

exports.resetAssessmentRating = async (req, res) => {
  try {
    const { facultyId, skillId } = req.body;
    
    if (req.user.role?.toLowerCase() === "faculty") {
      return res.status(403).json({ message: "Access denied: Only HOD/Admin can allow test retakes" });
    }

    const assessment = await Assessment.findOne({ facultyId });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    assessment.skillRatings = assessment.skillRatings.filter(
      (r) => r.skillId.toString() !== skillId.toString()
    );

    // Update the retake request status to approved
    if (assessment.retakeRequests) {
        const reqIdx = assessment.retakeRequests.findIndex(r => r.skillId.toString() === skillId.toString());
        if (reqIdx !== -1) {
            assessment.retakeRequests[reqIdx].status = "approved";
        }
    }

    await assessment.save();
    await calculateGapsForAssessment(assessment);

    res.status(200).json({ message: "Test score reset successfully. Faculty can now retake the test." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestRetake = async (req, res) => {
    try {
        const { skillId } = req.body;
        const facultyId = req.user.id; // From auth middleware

        let assessment = await Assessment.findOne({ facultyId });
        if (!assessment) {
             return res.status(404).json({ message: "Assessment not found for this faculty." });
        }

        if (!assessment.retakeRequests) assessment.retakeRequests = [];

        // Check if already requested
        const existingReq = assessment.retakeRequests.find(r => r.skillId.toString() === skillId.toString() && r.status === "pending");
        if (existingReq) {
             return res.status(400).json({ message: "A retake request for this skill is already pending." });
        }

        // Add the new request
        assessment.retakeRequests.push({
            skillId,
            status: "pending",
            requestDate: new Date()
        });

        await assessment.save();
        res.status(200).json({ message: "Retake request submitted successfully." });
    } catch (error) {
        console.error("Request Retake Error:", error);
        res.status(500).json({ message: "Failed to submit retake request." });
    }
};

exports.getAssessmentHistory = async (req, res) => {
    try {
        const filter = {};
        if (req.departmentId) {
            const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
            filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
        }

        // Fetch assessments, populating the deep paths for history and requests
        const assessments = await Assessment.find(filter)
            .populate("facultyId", "name email role")
            .populate("attemptsHistory.skillId", "name category")
            .populate("retakeRequests.skillId", "name category");

        res.status(200).json(assessments);
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: "Failed to fetch assessment histories." });
    }
};

exports.getPendingRetakes = async (req, res) => {
    try {
        const filter = {};
        if (req.departmentId) {
            const deptIdStr = req.departmentId._id ? req.departmentId._id.toString() : req.departmentId.toString();
            filter.departmentId = new mongoose.Types.ObjectId(deptIdStr);
        }

        const assessments = await Assessment.find(filter)
            .populate("facultyId", "name email avatar")
            .populate("retakeRequests.skillId", "name category");

        let pendingRequests = [];

        assessments.forEach(assessment => {
            if (assessment.retakeRequests && assessment.retakeRequests.length > 0) {
                assessment.retakeRequests.forEach(req => {
                    if (req.status === "pending") {
                        pendingRequests.push({
                            assessmentId: assessment._id,
                            facultyId: assessment.facultyId?._id,
                            facultyName: assessment.facultyId?.name,
                            facultyEmail: assessment.facultyId?.email,
                            skillId: req.skillId?._id,
                            skillName: req.skillId?.name,
                            skillCategory: req.skillId?.category,
                            requestedAt: req.requestedAt
                        });
                    }
                });
            }
        });

        // Sort by requestedAt descending (newest first)
        pendingRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectRetake = async (req, res) => {
    try {
        const { facultyId, skillId } = req.body;
        
        if (req.user.role?.toLowerCase() === "faculty") {
            return res.status(403).json({ message: "Access denied" });
        }

        const assessment = await Assessment.findOne({ facultyId });
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        if (assessment.retakeRequests) {
            const reqIdx = assessment.retakeRequests.findIndex(r => r.skillId.toString() === skillId.toString());
            if (reqIdx !== -1) {
                assessment.retakeRequests[reqIdx].status = "rejected";
            }
        }

        await assessment.save();
        res.status(200).json({ message: "Retake request rejected successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
