const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const Training = require("./src/schemas/TrainingSchema");
const SkillGap = require("./src/schemas/SkillGapSchema");
const Skill = require("./src/schemas/SkillSchema");

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const trainings = await Training.find().populate("skillsCovered.skillId");
        console.log("\n--- TRAININGS ---");
        trainings.forEach(t => {
            console.log(`T: ${t.title}`);
            t.skillsCovered.forEach(sc => {
                console.log(`  S: ${sc.skillId?.name} (ID: ${sc.skillId?._id})`);
                console.log(`  R: ${sc.minGapScore} to ${sc.maxGapScore || 'None'}`);
            });
        });

        const gaps = await SkillGap.find().populate("gaps.skillId");
        console.log("\n--- FACULTY GAPS ---");
        gaps.forEach(g => {
            console.log(`F: ${g.facultyId}`);
            g.gaps.forEach(gap => {
                console.log(`  S: ${gap.skillId?.name} (ID: ${gap.skillId?._id})`);
                console.log(`  G: ${gap.gapScore}`);
            });
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};
runDebug();
