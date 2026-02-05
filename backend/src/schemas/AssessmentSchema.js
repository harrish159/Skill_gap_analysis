const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillRatings: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },
        selfRating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed"],
      default: "draft",
      lowercase: true,
    },
    submittedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    comments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Assessment", assessmentSchema);
