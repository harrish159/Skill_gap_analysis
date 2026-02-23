const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        const gaps = await db.collection('skillgaps').find().toArray();
        console.log("--- GAPS ---");
        gaps.forEach(g => {
            console.log(`Gap ID: ${g._id}`);
            console.log(`  Dept ID: ${g.departmentId} | Type: ${g.departmentId?.constructor?.name}`);
        });

        const trainings = await db.collection('trainings').find().toArray();
        console.log("\n--- TRAININGS ---");
        trainings.forEach(t => {
            console.log(`Training: ${t.title}`);
            console.log(`  Dept ID: ${t.departmentId} | Type: ${t.departmentId?.constructor?.name}`);
        });

        const users = await db.collection('users').find({ name: 'Sibi' }).toArray();
        console.log("\n--- SIBI ---");
        users.forEach(u => {
            console.log(`User: ${u.name}`);
            console.log(`  Dept ID: ${u.departmentId} | Type: ${u.departmentId?.constructor?.name}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
