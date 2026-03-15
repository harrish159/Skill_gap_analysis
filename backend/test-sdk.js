const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function testSDK() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Testing with API Key (first 5):", apiKey ? apiKey.substring(0, 5) : "MISSING");
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Calling generateContent...");
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log("RESPONSE:", response.text());
  } catch (err) {
    console.error("SDK ERROR:", err);
    if (err.response) {
      console.error("Error Response:", err.response);
    }
  }
}

testSDK();
