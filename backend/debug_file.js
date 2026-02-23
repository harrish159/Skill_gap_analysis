const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, ".env") });

const Training = require("./src/schemas/TrainingSchema");
const SkillGap = require("./src/schemas/SkillGapSchema");

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let output = "DB DEBUG REPORT\n===============\n\n";

        const trainings = await Training.find().populate("skillsCovered.skillId");
        output += "TRAININGS:\n";
        trainings.forEach(t => {
            output += `T: ${t.title} (ID: ${t._id})\n`;
            t.skillsCovered.forEach(sc => {
                output += `  S: ${sc.skillId?.name} (ID: ${sc.skillId?._id})\n`;
                output += `  R: ${sc.minGapScore} to ${sc.maxGapScore || 'None'}\n`;
            });
        });

        const gaps = await SkillGap.find().populate("gaps.skillId");
        output += "\nFACULTY GAPS:\n";
        gaps.forEach(g => {
            output += `F: ${g.facultyId}\n`;
            g.gaps.forEach(gap => {
                output += `  S: ${gap.skillId?.name} (ID: ${gap.skillId?._id})\n`;
                output += `  G: ${gap.gapScore}\n`;
            });
        });

        fs.writeFileSync("debug_result.txt", output);
        console.log("Done writing to debug_result.txt");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};
runDebug();
