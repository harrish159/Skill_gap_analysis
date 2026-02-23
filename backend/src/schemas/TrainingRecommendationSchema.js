const mongoose = require("mongoose");

const trainingRecommendationSchema = new mongoose.Schema(
    {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        skillId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Skill",
            required: true,
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        recommendation: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Proposed", "Assigned", "Completed", "Cancelled"],
            default: "Proposed",
        },
    },
    { timestamps: true },
);

module.exports =
    mongoose.models.TrainingRecommendation ||
    mongoose.model("TrainingRecommendation", trainingRecommendationSchema);
