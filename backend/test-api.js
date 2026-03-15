const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-pro"];
  const results = {};

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hello");
      results[m] = { success: true, response: (await result.response).text() };
    } catch (err) {
      results[m] = { success: false, error: err.message };
    }
  }
  
  fs.writeFileSync('api-test-results.json', JSON.stringify(results, null, 2));
  console.log("Test finished.");
}

testModels();
