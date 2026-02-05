const mongoose = require("mongoose");

const skillMappingSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    requiredRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    }
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
