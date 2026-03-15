const mongoose = require("mongoose");

const skillMappingSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

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

    requiredRating: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SkillMapping", skillMappingSchema);

// requiredLevel: {
//   type: String,
//   enum: ["beginner", "intermediate", "advanced"],
//   required: true,
//   lowercase: true,
// },
