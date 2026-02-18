const mongoose = require("mongoose");
const ApprovalRequest = require("../schemas/ApprovalSchema");
const SkillGap = require("../schemas/SkillGapSchema");

// =============================
// Faculty: Create a training request (simplified approval request)
// =============================
exports.createTrainingRequest = async (req, res) => {
  try {
    const { facultyId, skillId } = req.body;

    if (!facultyId || !skillId) {
      return res.status(400).json({
        message: "facultyId and skillId are required",
      });
    }

    // Check for existing pending request for this specific skill
    const existingPending = await ApprovalRequest.findOne({
      facultyId,
      status: "Pending",
      "requestedSkills.skillId": skillId
    });

    if (existingPending) {
      return res.status(400).json({
        message: "A training request for this skill is already pending approval",
      });
    }

    // Fetch skill gap data to get the gap score
    const skillGap = await SkillGap.findOne({ facultyId })
      .populate("gaps.skillId", "name category");

    if (!skillGap) {
      return res.status(404).json({
        message: "No skill gap found for this faculty",
      });
    }

    // Find the specific skill gap
    const gap = skillGap.gaps.find(
      (g) => g.skillId._id.toString() === skillId.toString()
    );

    if (!gap) {
      return res.status(404).json({
        message: "Skill not found in faculty's gap analysis",
      });
    }

    // Create approval request
    const approvalRequest = new ApprovalRequest({
      facultyId,
      requestedCourse: `Training for ${gap.skillId.name}`,
      requestedWorkshop: null,
      requestedSkills: [
        {
          skillId: gap.skillId._id,
          gapScore: gap.gapScore,
        },
      ],
      status: "Pending",
      createdAt: new Date(),
    });

    await approvalRequest.save();

    console.log(`-> Training request created for faculty ${facultyId}, skill ${gap.skillId.name}`);

    res.status(201).json({
      message: "Training request submitted successfully",
      requestId: approvalRequest._id,
    });
  } catch (error) {
    console.error("Error creating training request:", error);
    res.status(500).json({ message: "Error creating training request" });
  }
};

// =============================
// Faculty: Create a new approval request
// =============================
exports.createApprovalRequest = async (req, res) => {
  try {
    const { facultyId, requestedCourse, requestedWorkshop, requestedSkills } =
      req.body;

    if (!facultyId || !requestedCourse || !requestedSkills?.length) {
      return res.status(400).json({
        message: "facultyId, requestedCourse and requestedSkills are required",
      });
    }

    // Extract skill IDs from requestedSkills array
    const skillIds = requestedSkills.map(s => s.skillId);

    // Check if any of these skills already have a pending request
    const existingPending = await ApprovalRequest.findOne({
      facultyId,
      status: "Pending",
      "requestedSkills.skillId": { $in: skillIds }
    });

    if (existingPending) {
      return res.status(400).json({
        message: "One or more of the selected skills already have a pending approval request",
      });
    }

    const approvalRequest = new ApprovalRequest({
      facultyId,
      requestedCourse,
      requestedWorkshop: requestedWorkshop || null,
      requestedSkills,
      status: "Pending", // ensure default
      createdAt: new Date(),
    });

    await approvalRequest.save();

    res.status(201).json({
      message: "Approval request created successfully",
      requestId: approvalRequest._id,
    });
  } catch (error) {
    console.error("Error creating approval request:", error);
    res.status(500).json({ message: "Error creating approval request" });
  }
};

exports.GetAllRequests = async (req, res) => {
  try {
    const requests = await ApprovalRequest.find()
      .populate("facultyId", "name email role department")
      .populate("requestedSkills.skillId", "name category")
      .sort({ createdAt: -1 });
    console.log(requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Error fetching requests" });
  }
};

exports.getPendingRequestsForHOD = async (req, res) => {
  try {
    const requests = await ApprovalRequest.find({ status: "Pending" })
      .populate("facultyId", "name email role")
      .populate("requestedSkills.skillId", "name category")
      .sort({ createdAt: -1 });
    console.log(requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Error fetching pending requests" });
  }
};

exports.updateApprovalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reason, hodSkills } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Accepted or Rejected" });
    }

    const request = await ApprovalRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    request.status = status;
    request.reason = reason || "";
    request.hodSkills = hodSkills || [];
    request.updatedAt = new Date();

    await request.save();

    res
      .status(200)
      .json({ message: `Request ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error("Error updating approval request:", error);
    res.status(500).json({ message: "Error updating approval request" });
  }
};
