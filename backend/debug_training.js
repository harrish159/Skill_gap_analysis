const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

// Import Schemas
const Training = require("./src/schemas/TrainingSchema");
const SkillGap = require("./src/schemas/SkillGapSchema");
const Skill = require("./src/schemas/SkillSchema");
const User = require("./src/schemas/UserSchema");

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--> Connected to DB");

        // 1. Check Skills
        const skills = await Skill.find();
        console.log("\n--- SKILLS ---");
        skills.forEach(s => console.log(`ID: ${s._id} | Name: ${s.name}`));

        // 2. Check Trainings
        const trainings = await Training.find().populate("skillsCovered.skillId");
        console.log("\n--- TRAININGS ---");
        trainings.forEach(t => {
            console.log(`Title: ${t.title}`);
            t.skillsCovered.forEach(sc => {
                console.log(`  - Skill: ${sc.skillId ? sc.skillId.name : 'NULL'} (ID: ${sc.skillId ? sc.skillId._id : 'N/A'})`);
                console.log(`    Range: ${sc.minGapScore} to ${sc.maxGapScore || 'None'}`);
            });
        });

        // 3. Check Skill Gaps
        const gaps = await SkillGap.find().populate("gaps.skillId");
        console.log("\n--- SKILL GAPS ---");
        gaps.forEach(g => {
            console.log(`Faculty ID: ${g.facultyId}`);
            g.gaps.forEach(gap => {
                console.log(`  - Skill: ${gap.skillId ? gap.skillId.name : 'NULL'} (ID: ${gap.skillId ? gap.skillId._id : 'N/A'})`);
                console.log(`    Score: ${gap.gapScore}`);
            });
        });

    } catch (err) {
        console.error("Debug Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
