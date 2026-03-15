const mongoose = require("mongoose");

const skillGapSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    gaps: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },

        requiredRating: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },

        currentRating: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },

        gapScore: {
          type: Number,
          min: 0,
          required: true,
        },

        gapSeverity: {
          type: String,
          enum: ["low", "medium", "high"],
          required: true,
        },
        comments: {
          type: String,
          default: "",
        },
      },
    ],

    totalGaps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("SkillGap", skillGapSchema);
