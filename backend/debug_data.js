const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

// Import Schemas
const SkillMapping = require("./src/schemas/SkillMappingSchema");
const Assessment = require("./src/schemas/AssessmentSchema");
const Skill = require("./src/schemas/SkillSchema");
const User = require("./src/schemas/UserSchema");

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--> Connected to DB");

        // 1. Check Skills
        const skills = await Skill.find();
        console.log(`--> Found ${skills.length} Skills.`);

        // 2. Check SkillMappings
        const mappings = await SkillMapping.find().populate("skillId");
        console.log(`--> Found ${mappings.length} SkillMappings.`);

        let brokenMappings = 0;
        mappings.forEach((m, i) => {
            if (!m.skillId) {
                console.warn(`    [!] Mapping #${i} has NULL skillId. ID: ${m._id}`);
                brokenMappings++;
            }
        });

        if (brokenMappings > 0) {
            console.error(`--> CRITICAL: ${brokenMappings} mappings have broken skill references!`);
        } else {
            console.log("--> All mappings have valid skill references.");
        }

        // 3. Check Assessments
        const assessments = await Assessment.find();
        console.log(`--> Found ${assessments.length} Assessments.`);

        assessments.forEach(a => {
            console.log(`    Assessment for Faculty ${a.facultyId}: ${a.skillRatings.length} ratings.`);
        });

    } catch (err) {
        console.error("Debug Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
