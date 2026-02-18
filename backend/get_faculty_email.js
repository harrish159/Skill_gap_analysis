const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

// Minimal User Schema
const userSchema = new mongoose.Schema({ role: String, name: String, email: String });
const User = mongoose.model("User", userSchema);

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const facultyMember = await User.findOne({ role: { $regex: /faculty/i } });

        if (facultyMember) {
            console.log(`FOUND_EMAIL: ${facultyMember.email}`);
        } else {
            console.log("FOUND_EMAIL: NONE");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
