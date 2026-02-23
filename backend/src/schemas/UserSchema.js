const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "HOD", "FACULTY"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: function () {
        return this.role !== "ADMIN";
      },
    },
  },
  { timestamps: true },
);

// Replace your old module.exports line with this:
module.exports = mongoose.models.User || mongoose.model("User", userSchema);