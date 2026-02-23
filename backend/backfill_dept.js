const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const runBackfill = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        const gaps = await db.collection('skillgaps').find().toArray();
        console.log(`Checking ${gaps.length} SkillGap records...`);

        for (const g of gaps) {
            if (!g.departmentId) {
                console.log(`Gap ${g._id} missing departmentId. Fetching from user...`);
                const user = await db.collection('users').findOne({ _id: g.facultyId });
                if (user && user.departmentId) {
                    await db.collection('skillgaps').updateOne(
                        { _id: g._id },
                        { $set: { departmentId: user.departmentId } }
                    );
                    console.log(`  -> Successfully assigned Dept ${user.departmentId} to Gap ${g._id}`);
                } else {
                    console.log(`  [!] Could not find department for Faculty ${g.facultyId}`);
                }
            } else {
                console.log(`Gap ${g._id} already has departmentId: ${g.departmentId}`);
            }
        }

        console.log("\nBackfill complete.");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

runBackfill();
