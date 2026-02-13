const mongoose = require("mongoose");
const ApprovalRequest = require("../schemas/ApprovalSchema");

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
    const requests = await ApprovalRequest.find();
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
