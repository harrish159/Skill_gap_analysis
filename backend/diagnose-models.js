const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a direct listModels in the simple SDK usually used this way,
    // but we can try a few different model names.
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        console.log(`Model ${modelName} is working!`);
        return;
      } catch (e) {
        console.log(`Model ${modelName} failed: ${e.message}`);
      }
    }
  } catch (error) {
    console.error("General Error:", error.message);
  }
}

listModels();
