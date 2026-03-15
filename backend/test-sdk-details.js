const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no direct listModels in the new SDK as of some versions, 
    // but we can try to hit an endpoint or check documentation.
    // In @google/generative-ai, listModels is not a method on the main class usually.
    // It's usually handled via the discovery API or just knowing the names.
    
    console.log("Attempting to call gemini-1.5-flash which is standard...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR TYPE:", err.constructor.name);
    console.error("ERROR MESSAGE:", err.message);
    if (err.stack) console.log("STACK:", err.stack);
  }
}

listModels();
