const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Skill = require("./src/schemas/SkillSchema");
const { generateMCQs } = require("./src/controllers/aiController");

dotenv.config();

async function verify() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skillgap");
    console.log("Connected.");

    // Find a skill (any skill)
    const skill = await Skill.findOne();
    if (!skill) {
      console.error("No skills found in database. Please create one first.");
      process.exit(1);
    }

    console.log(`Verifying question generation for skill: ${skill.name}`);

    // Mock req and res
    const req = {
      body: { skillId: skill._id }
    };

    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`Response Status: ${code}`);
          if (code === 200) {
            console.log(`Successfully generated ${data.length} questions.`);
            console.log("First question sample:", JSON.stringify(data[0], null, 2));
            
            // Check if it's AI generated (should have 'ai-' prefix in ID)
            const isAI = data.every(q => q.id && (q.id.startsWith("ai-") || q.id.startsWith("ai-simple-")));
            console.log("Is AI Generated:", isAI);
            
            // Check for 'explanation' which was missing in fallbacks
            const hasExplanations = data.every(q => q.explanation);
            console.log("Has Explanations:", hasExplanations);
          } else {
            console.error("Generation failed:", data);
          }
        }
      })
    };

    await generateMCQs(req, res);

  } catch (err) {
    console.error("Verification Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

verify();
