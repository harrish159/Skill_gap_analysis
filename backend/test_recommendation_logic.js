const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const Training = require("./src/schemas/TrainingSchema");
const SkillGap = require("./src/schemas/SkillGapSchema");
const User = require("./src/schemas/UserSchema");

const testRecommendation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Find a faculty who has gaps
        const faculty = await User.findOne({ role: { $regex: /^faculty$/i } });
        if (!faculty) {
            console.log("No faculty found");
            return;
        }
        console.log(`Testing for Faculty: ${faculty.name} (Dept: ${faculty.department})`);

        const skillGap = await SkillGap.findOne({ facultyId: faculty._id }).populate("gaps.skillId");
        if (!skillGap) {
            console.log("No skill gap found for this faculty");
            return;
        }
        console.log(`Faculty Dept ID in SkillGap: ${skillGap.departmentId}`);

        for (const gap of skillGap.gaps) {
            console.log(`\nChecking Skill: ${gap.skillId.name} (Gap: ${gap.gapScore})`);

            const filter = {
                isActive: true,
                departmentId: skillGap.departmentId,
                skillsCovered: {
                    $elemMatch: {
                        skillId: gap.skillId._id,
                        minGapScore: { $lte: gap.gapScore },
                        $or: [
                            { maxGapScore: { $gte: gap.gapScore } },
                            { maxGapScore: { $exists: false } },
                            { maxGapScore: null }
                        ]
                    }
                }
            };

            const matches = await Training.find(filter);
            console.log(`Found ${matches.length} matches for this skill.`);
            matches.forEach(m => console.log(`  - ${m.title} (Dept: ${m.departmentId})`));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

testRecommendation();
