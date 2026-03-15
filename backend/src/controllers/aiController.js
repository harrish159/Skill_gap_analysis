const { GoogleGenerativeAI } = require("@google/generative-ai");
const Skill = require("../schemas/SkillSchema");

/**
 * Generates MCQs using the Gemini API.
 * Prioritizes high-quality, specialized prompts, then falls back to a simpler prompt
 * if the first attempt fails.
 */
const generateMCQs = async (req, res) => {
  try {
    const { skillId } = req.body;
    const skill = await Skill.findById(skillId);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === "your_api_key_here" || !apiKey.startsWith("AIza")) {
      console.error("[AI-GEN] Gemini API Key missing or invalid.");
      return res.status(500).json({ message: "AI Configuration error: Invalid API Key" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const skillNameLower = skill.name.toLowerCase();
    const isAptitude = skillNameLower.includes("aptitude") || skillNameLower.includes("reasoning");
    const isCoding = ["java", "python", "javascript", "c++", "c#", "php", "ruby", "go", "coding", "programming", "database", "sql"].some(lang => skillNameLower.includes(lang));

    const skillContext = `Skill: ${skill.name}
Category: ${skill.category}
Proficiency Level Expected: ${skill.proficiencyLevel || "Beginner"}
Description: ${skill.description || "No specific description provided."}`;

    // specialized difficulty instructions based on proficiency level
    let levelInstructions = "";
    const level = (skill.proficiencyLevel || "Beginner").toLowerCase();
    if (level === "advanced") {
      levelInstructions = "- The questions must be extremely challenging, evaluating deep knowledge, complex scenarios, and expert-level understanding.";
    } else if (level === "intermediate") {
      levelInstructions = "- The questions should assess working knowledge, application of concepts, and moderate problem-solving.";
    } else {
      levelInstructions = "- The questions should assess foundational knowledge, terminology, and basic concepts.";
    }

    // specialized instructions for different skill types
    let specializedInstructions = "";
    if (isCoding) {
      specializedInstructions = `
- Include technical questions or problem-solving scenarios related to ${skill.name}.
- For programming languages, include code snippet analysis.
- Focus on concepts like concurrency, memory management, and design patterns if applicable.`;
    } else if (isAptitude) {
      specializedInstructions = `
- Generate aptitude questions covering areas like ${skill.name}.
- Vary difficulty from foundational to complex multi-step problems.`;
    } else {
      specializedInstructions = `
- Focus on practical applications and real-world challenges in ${skill.name}.
- Avoid overly simplistic definitions.`;
    }

    // Attempt generation with a few model options based on available list
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemma-3-12b-it"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI-GEN] Attempting generation for skill: ${skill.name} using ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Generate ${skill.noOfMcqs || 10} multiple choice questions to assess proficiency in:
${skillContext}

Requirements:
- Level: Appropriate for faculty/senior assessment aiming for the specified proficiency level.
- ${levelInstructions}
- ${specializedInstructions}
- Each question must have exactly 4 options and one clear correct answer.
- Return ONLY a valid JSON array of objects.
- Ensure diversity in question topics.

Format Example:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "...",
    "explanation": "..."
  }
]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Basic JSON extraction and cleanup
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          // Replace literal newlines/control characters within strings that break JSON parsing
          text = jsonMatch[0].replace(/[\u0000-\u0019]+/g, ""); 
        }

        const mcqs = JSON.parse(text);

        // Add unique IDs and ensure structure
        const sanitizedMcqs = mcqs.map((q, idx) => ({
          question: q.question || "Untitled Question",
          options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
          correct_answer: q.correct_answer || (q.options ? q.options[0] : "Option A"),
          explanation: q.explanation || "No explanation provided.",
          id: `ai-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`
        }));

        console.log(`[AI-GEN] Successfully generated ${sanitizedMcqs.length} questions for ${skill.name}`);
        return res.status(200).json(sanitizedMcqs);

      } catch (err) {
        console.warn(`[AI-GEN] Model ${modelName} failed: ${err.message}`);
        lastError = err;
      }
    }

    // Ultimate Fallback: Try one very simple prompt if all else fails
    try {
      console.log(`[AI-GEN] Final attempt with simplified prompt for: ${skill.name}`);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const simplePrompt = `List 5 basic multiple choice questions about "${skill.name}" in JSON format: [{"question": "...", "options": ["...", "..."], "correct_answer": "..."}]`;

      const result = await model.generateContent(simplePrompt);
      const text = (await result.response).text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const mcqs = JSON.parse(jsonMatch[0]);
        const sanitized = mcqs.map((q, i) => ({
          ...q,
          id: `ai-simple-${Date.now()}-${i}`,
          explanation: q.explanation || "Basic competency check."
        }));
        return res.status(200).json(sanitized);
      }
    } catch (finalErr) {
      console.error("[AI-GEN] All generation attempts failed completely.");
    }

    throw lastError || new Error("Failed to generate questions via AI");

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({
      message: "Internal server error during MCQ generation",
      error: error.message
    });
  }
};

module.exports = { generateMCQs };
