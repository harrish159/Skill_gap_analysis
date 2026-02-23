const mongoose = require("mongoose");

const ApprovalRequestSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Training",
    required: false,
  },
  requestedCourse: {
    type: String,
    required: true,
  },
  requestedWorkshop: {
    type: String,
    required: false, // optional if they only request a course
  },
  requestedSkills: [
    {
      skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
      gapScore: {
        type: Number,
        required: true,
      },
    },
  ],
  hodSkills: [
    {
      skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
      requiredLevel: {
        type: Number,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  reason: {
    type: String, // optional reason for rejection/acceptance comments
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("ApprovalRequest", ApprovalRequestSchema);
