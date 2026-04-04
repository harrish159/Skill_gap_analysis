require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  console.log("🚀 Testing Gemini API Connection...");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ ERROR: No GEMINI_API_KEY found in .env");
    return;
  }
  
  console.log("[KEY CHECK] Key found: " + apiKey.substring(0, 8) + "...");

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🤖 Attempting to use model: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Generate exactly 1 multiple choice question about JavaScript.
      STRICT FORMAT RULES: You MUST return ONLY a valid JSON array of exactly 1 object.
      Format Example: [{"question": "...", "options": ["..."], "correct_answer": "...", "explanation": "..."}]`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();

      console.log("✅ RAW RESPONSE TEXT arrived:");
      console.log(text.substring(0, 150) + "...");

      let cleanText = text;
      if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      else if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.replace(/\`\`\`/g, '').trim();

      const parsed = JSON.parse(cleanText);
      console.log("🎉 SUCCESS! Extracted structured JSON:");
      console.log(parsed);
      break; 
    } catch (err) {
      console.error(`❌ ERROR with ${modelName}:`, err.message);
    }
  }
}

testGemini();
