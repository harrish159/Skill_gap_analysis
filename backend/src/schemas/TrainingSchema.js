const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },

    provider: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["workshop", "course", "certification", "webinar"],
      lowercase: true,
      required: true,
    },

    mode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      lowercase: true,
      required: true,
    },

    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },

    skillsCovered: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },

        minGapScore: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },

        maxGapScore: {
          type: Number,
          min: 1,
          max: 5,
        },

        improvesBy: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],

    targetProficiencyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      lowercase: true,
      required: true,
    },

    startDate: {
      type: Date,
      required: false,
    },
    deadline: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Training", trainingSchema);
