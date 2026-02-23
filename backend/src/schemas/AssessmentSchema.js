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
          default: 0,
          min: 0,
          max: 5,
        },
        gap: {
          type: Number,
          default: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
      lowercase: true,
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assessment", assessmentSchema);
