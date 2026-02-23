const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, ".env") });

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        let out = "DEBUG REPORT\n============\n\n";

        const gaps = await db.collection('skillgaps').find().toArray();
        out += "--- GAPS ---\n";
        gaps.forEach(g => {
            out += `Gap ID: ${g._id}\n`;
            out += `  Faculty ID: ${g.facultyId}\n`;
            out += `  Dept ID: ${g.departmentId} | Type: ${g.departmentId?.constructor?.name}\n`;
            g.gaps.forEach(gap => {
                out += `    Skill: ${gap.skillId} | Gap: ${gap.gapScore}\n`;
            });
        });

        const trainings = await db.collection('trainings').find().toArray();
        out += "\n--- TRAININGS ---\n";
        trainings.forEach(t => {
            out += `Training: ${t.title}\n`;
            out += `  Dept ID: ${t.departmentId} | Type: ${t.departmentId?.constructor?.name}\n`;
            t.skillsCovered.forEach(s => {
                out += `    Skill: ${s.skillId} | MinGap: ${s.minGapScore}\n`;
            });
        });

        fs.writeFileSync("debug_report.txt", out);
        console.log("Wrote report to debug_report.txt");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
