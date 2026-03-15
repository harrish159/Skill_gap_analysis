require('dotenv').config();
const fs = require('fs');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
       const names = data.models.map(m => m.name.replace('models/', ''));
       console.log("AVAILABLE MODELS:", names.join(", "));
       fs.writeFileSync('available-models.json', JSON.stringify(names, null, 2));
    } else {
       console.log("Error or no models format:", data);
    }
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

listModels();
