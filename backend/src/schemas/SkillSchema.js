const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Technical", "Teaching", "Research", "Soft Skill"],
      required: true,
    },

    description: {
      type: String,
    },

    proficiencyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    targetScore: {
      type: Number,
      required: true,
      default: 80,
      min: 0,
      max: 100,
    },

    noOfMcqs: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Skill", skillSchema);
