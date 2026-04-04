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
      levelInstructions = "- The questions should assess foundational knowledge, terminology, and basic concepts of the skill It is rele";
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

    // Determine chunks to avoid LLM token limits (max 10 questions per chunk)
    const targetCount = skill.noOfMcqs || 10;
    const chunkSize = 10;
    const chunkCounts = [];
    let remaining = targetCount;
    while(remaining > 0) {
        chunkCounts.push(Math.min(remaining, chunkSize));
        remaining -= chunkSize;
    }

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let lastError = null;
    let allGeneratedMcqs = [];

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI-GEN] >>> Starting generation attempt for "${skill.name}"...`);
        console.log(`[AI-GEN] --- Model: ${modelName}`);
        console.log(`[AI-GEN] --- Preparing ${chunkCounts.length} chunks to generate a total of ${targetCount} MCQs...`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        allGeneratedMcqs = [];

        // Run chunks in parallel to save time
        const promises = chunkCounts.map((count, index) => {
          console.log(`[AI-GEN]     -> Initiating Chunk ${index + 1} for ${count} questions...`);
          const prompt = `You are an expert assessment content generator and UI formatter.
Generate exactly ${count} multiple choice questions to assess proficiency in:
${skillContext}

STRICT FORMAT RULES:
1. You MUST return ONLY a valid JSON array of exactly ${count} objects.
2. Code Formatting: Place ALL code (Java, HTML, SQL, etc depending on skill) inside the "code" field. Use indentation and line breaks properly.
3. Options: Exactly 4 options. Each option must be concise and aligned.

Format Example:
[
  {
    "title": "Short descriptive title",
    "problem": "Clear explanation of the context or scenario.",
    "code": "properly formatted multiline code without markdown backticks, or empty string if none",
    "question": "The specific question being asked?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correct_answer": "Option A text",
    "explanation": "Clear and concise explanation."
  }
]

Special instructions:
- Level: Appropriate for faculty/senior assessment aiming for the specified proficiency level.
- ${levelInstructions}
- ${specializedInstructions}
- Ensure diversity in question topics.`;

          return model.generateContent(prompt).then(async (result) => {
            console.log(`[AI-GEN]     <- Received raw response for Chunk ${index + 1}`);
            const response = await result.response;
            const text = response.text();
            console.log(`[AI-GEN]     <- Raw Text (Snippet):`, text.substring(0, 100) + "...");
            
            // Clean up any potential markdown formatting the AI might add despite instructions
            let cleanText = text;
            if (cleanText.startsWith('\`\`\`json')) {
              cleanText = cleanText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            } else if (cleanText.startsWith('\`\`\`')) {
              cleanText = cleanText.replace(/\`\`\`/g, '').trim();
            }
            
            try {
              const parsed = JSON.parse(cleanText);
              console.log(`[AI-GEN]     <- Successfully parsed JSON for Chunk ${index + 1} (${parsed.length} questions)`);
              return parsed;
            } catch (parseError) {
              console.error(`[AI-GEN]     !> JSON Parse Failed in Chunk ${index + 1}:`, parseError.message);
              console.error(`[AI-GEN]     !> Problematic Text:`, cleanText);
              throw parseError;
            }
          }).catch(err => {
              console.error(`[AI-GEN]     !> API Call completely failed in Chunk ${index + 1}:`, err.message);
              throw err;
          });
        });

        // Wait for all chunks
        console.log(`[AI-GEN] --- Waiting for all chunks to resolve...`);
        const chunksResult = await Promise.all(promises);
        console.log(`[AI-GEN] --- All chunks resolved successfully! Flattening results...`);
        
        // Flatten and aggregate
        chunksResult.forEach(chunk => {
            if (Array.isArray(chunk)) {
                allGeneratedMcqs.push(...chunk);
            }
        });

        console.log(`[AI-GEN] --- Generated a total of ${allGeneratedMcqs.length} MCQs out of desired ${targetCount}.`);

        // If we got all chunks successfully (or at least close) we break 
        if (allGeneratedMcqs.length >= targetCount * 0.8) {
            console.log(`[AI-GEN] >>> Generation attempt SUCCEEDED for ${modelName}`);
            break;
        } else {
            console.log(`[AI-GEN] >>> Generation insufficient (${allGeneratedMcqs.length} < ${targetCount}). Throwing internal error to retry...`);
            throw new Error(`Only got ${allGeneratedMcqs.length} questions out of ${targetCount}`);
        }

      } catch (err) {
        console.warn(`[AI-GEN] >>> Model attempt ${modelName} FAILED: ${err.message}`);
        lastError = err;
        allGeneratedMcqs = []; // reset for next model
      }
    }

    // Process our results if we succeeded
    if (allGeneratedMcqs.length > 0) {
      // Limit to exact requested amount just in case the LLM returned extra
      allGeneratedMcqs = allGeneratedMcqs.slice(0, targetCount);

      // Add unique IDs and ensure structure
      const sanitizedMcqs = allGeneratedMcqs.map((q, idx) => ({
        title: q.title || "",
        problem: q.problem || "",
        code: q.code || "",
        question: q.question || "Untitled Question",
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
        correct_answer: q.correct_answer || (q.options ? q.options[0] : "Option A"),
        explanation: q.explanation || "No explanation provided.",
        id: `ai-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`
      }));

      console.log(`[AI-GEN] Successfully generated exactly ${sanitizedMcqs.length} questions for ${skill.name}`);
      return res.status(200).json(sanitizedMcqs);
    }

    // Ultimate Fallback: Try one very simple prompt if all else fails
    try {
      console.log(`[AI-GEN] Final attempt with simplified prompt for: ${skill.name}`);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
      const simplePrompt = `List 5 basic multiple choice questions about "${skill.name}". Format strictly as JSON array: [{"question": "...", "options": ["...", "..."], "correct_answer": "...", "explanation": "..."}]`;

      const result = await model.generateContent(simplePrompt);
      const text = (await result.response).text();
      
      let cleanText = text;
      if (cleanText.startsWith('\`\`\`json')) {
         cleanText = cleanText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      } else if (cleanText.startsWith('\`\`\`')) {
         cleanText = cleanText.replace(/\`\`\`/g, '').trim();
      }
      
      const mcqs = JSON.parse(cleanText);
      const sanitized = mcqs.map((q, i) => ({
          ...q,
          id: `ai-simple-${Date.now()}-${i}`,
          explanation: q.explanation || "Basic competency check."
        }));
        return res.status(200).json(sanitized);
    } catch (finalErr) {
      console.error("[AI-GEN] Ultimate fallback API attempt failed:", finalErr.message);
    }

    // If all attempts (and ultimate fallback attempt) failed:
    console.error("[AI-GEN] All generation attempts failed completely. Using default generic questions.");

    // Fallback static 10 questions tailored to the specific skill
    const fallbackQuestions = [
      {
        question: `What is the primary purpose and core concept of ${skill.name}?`,
        options: [
          `To manage the fundamental lifecycle and processes of ${skill.name}`,
          `To bypass security and logic rules entirely`,
          `To provide a legacy approach no longer used in modern systems`,
          `To act as a deprecated placeholder`
        ],
        correct_answer: `To manage the fundamental lifecycle and processes of ${skill.name}`,
        explanation: `Understanding the primary purpose of ${skill.name} is the first step to mastering it.`
      },
      {
        question: `Which of the following is considered a best practice when working with ${skill.name}?`,
        options: [
          `Handling errors and edge cases gracefully`,
          `Ignoring official documentation and guidelines`,
          `Using anti-patterns to speed up delivery`,
          `Hardcoding sensitive information and credentials`
        ],
        correct_answer: `Handling errors and edge cases gracefully`,
        explanation: `Best practices in ${skill.name} always emphasize robust error handling and adherence to standards.`
      },
      {
        question: `What is a common challenge or limitation associated with ${skill.name}?`,
        options: [
          `Complexity in scaling or managing edge cases properly`,
          `It is impossible to integrate with any other systems`,
          `It requires physical specialized hardware for any basic operation`,
          `It only supports a single user at any given time globally`
        ],
        correct_answer: `Complexity in scaling or managing edge cases properly`,
        explanation: `Like most skills and domains, ${skill.name} requires careful planning to scale and handle complex cases.`
      },
      {
        question: `In a professional setting, how is proficiency in ${skill.name} typically demonstrated?`,
        options: [
          `By applying concepts to solve real-world problems effectively`,
          `By memorizing definitions without understanding context`,
          `By avoiding its use whenever possible`,
          `By delegating all related tasks to other team members`
        ],
        correct_answer: `By applying concepts to solve real-world problems effectively`,
        explanation: `Demonstrating proficiency in ${skill.name} means knowing how and when to apply it practically.`
      },
      {
        question: `Which methodology or approach is most aligned with modern ${skill.name}?`,
        options: [
          `Iterative, efficient, and standardized workflows`,
          `Randomized trial and error with no documentation`,
          `Strictly manual processing without any optimization`,
          `Using unverified and outdated resources`
        ],
        correct_answer: `Iterative, efficient, and standardized workflows`,
        explanation: `Modern usage of ${skill.name} aligns with optimized and standardized professional methodologies.`
      },
      {
        question: `If a critical error occurs related to ${skill.name}, what is the recommended first step?`,
        options: [
          `Analyze the root cause and review relevant symptoms or logs`,
          `Delete everything and start over repeatedly`,
          `Ignore the error and hope it resolves itself automatically`,
          `Blame hardware limitations unconditionally`
        ],
        correct_answer: `Analyze the root cause and review relevant symptoms or logs`,
        explanation: `Troubleshooting ${skill.name} requires careful analysis of logs, symptoms, and root causes.`
      },
      {
        question: `What role does ongoing learning play in maintaining ${skill.name}?`,
        options: [
          `It is crucial because standards and practices evolve over time`,
          `It is irrelevant because nothing ever changes`,
          `It is only necessary for complete beginners`,
          `It is discouraged to prevent overthinking`
        ],
        correct_answer: `It is crucial because standards and practices evolve over time`,
        explanation: `Continuous learning is essential for ${skill.name} to keep up with industry advancements.`
      },
      {
        question: `How does ${skill.name} integrate with broader organizational goals?`,
        options: [
          `It enhances capabilities, efficiency, or quality of outputs`,
          `It generally introduces unnecessary roadblocks and delays`,
          `It is completely isolated from all other goals`,
          `It reduces the overall competency of the team`
        ],
        correct_answer: `It enhances capabilities, efficiency, or quality of outputs`,
        explanation: `Effective use of ${skill.name} directly contributes to achieving broader goals and improvements.`
      },
      {
        question: `When evaluating someone's expertise in ${skill.name}, which metric is most valuable?`,
        options: [
          `Quality of application and problem-solving success rate`,
          `The number of hours spent reading about it`,
          `The volume of complaints raised about the subject`,
          `The ability to explain it using untranslated foreign languages`
        ],
        correct_answer: `Quality of application and problem-solving success rate`,
        explanation: `Practical success and high-quality application are the best metrics for ${skill.name} expertise.`
      },
      {
        question: `What is the most effective way to optimize processes involving ${skill.name}?`,
        options: [
          `Implementing structured reviews, automation, or regular audits`,
          `Adding more redundant steps without evaluating them`,
          `Removing all quality control measures to save time`,
          `Refusing to adapt or change any existing workflows`
        ],
        correct_answer: `Implementing structured reviews, automation, or regular audits`,
        explanation: `Optimization in ${skill.name} involves standardizing, auditing, and automating where appropriate.`
      }
    ].slice(0, skill.noOfMcqs || 10);

    const sanitizedFallback = fallbackQuestions.map((q, i) => ({
      ...q,
      id: `ai-fallback-${Date.now()}-${i}`
    }));

    return res.status(200).json(sanitizedFallback);

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({
      message: "Internal server error during MCQ generation",
      error: error.message
    });
  }
};

module.exports = { generateMCQs };
