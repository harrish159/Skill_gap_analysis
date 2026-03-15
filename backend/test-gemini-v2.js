const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'API is working'");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Gemini Test Error:", error.message);
    if (error.response) {
      console.error("Details:", error.response.data);
    }
  }
}

testGemini();
