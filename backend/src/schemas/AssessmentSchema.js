const mongoose = require("mongoose");

// AssessmentSchema.js
const assessmentSchema = new mongoose.Schema(
  {
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
    skillRatings: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },
        hodRating: {
          type: Number,
          min: 0,
          max: 100,
        },
        gap: {
          type: Number,
          default: 0,
        },
        comments: {
          type: String,
          default: "",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
      lowercase: true,
    },
    attemptsHistory: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        attemptNumber: {
          type: Number,
          required: true,
          default: 1,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    retakeRequests: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        requestDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assessment", assessmentSchema);
