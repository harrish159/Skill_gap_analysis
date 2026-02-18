const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "backend/.env") });

// Minimal Schemas
const userSchema = new mongoose.Schema({ role: String, name: String });
const User = mongoose.model("User", userSchema);

const assessmentSchema = new mongoose.Schema({ facultyId: mongoose.Schema.Types.ObjectId, skillRatings: [] });
const Assessment = mongoose.model("Assessment", assessmentSchema);

const runQuickDebug = async () => {
    try {
        console.log("--> Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--> Connected.");

        // Find a faculty
        const faculty = await User.findOne({ role: "faculty" }); // Case insensitive? usually stored as 'faculty' or 'FACULTY'
        // Let's try regex to be safe
        const facultyMember = await User.findOne({ role: { $regex: /faculty/i } });

        if (!facultyMember) {
            console.log("--> No faculty member found in DB!");
        } else {
            // Added email to log output
            console.log(`--> Found Faculty: ${facultyMember.name} (Email: ${facultyMember.email || "No Email Provided"})`);
            console.log(`--> Start Time: ${new Date().toISOString()}`);
            console.log(`--> Found Faculty: ${facultyMember.name} (ID: ${facultyMember._id})`);

            // Check Assessment
            const assessment = await Assessment.findOne({ facultyId: facultyMember._id });
            if (assessment) {
                console.log(`--> Assessment found! Contains ${assessment.skillRatings.length} ratings.`);
                console.log("--> First 3 ratings:", assessment.skillRatings.slice(0, 3));
            } else {
                console.log("--> No assessment found for this faculty.");
            }
        }

    } catch (err) {
        console.error("--> Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("--> Disconnected.");
    }
};

runQuickDebug();
