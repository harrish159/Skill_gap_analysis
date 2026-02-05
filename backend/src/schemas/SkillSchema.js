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

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: String,
       required: true,},
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Skill", skillSchema);
