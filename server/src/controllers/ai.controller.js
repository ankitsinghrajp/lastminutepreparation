import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askOpenAI } from "../utils/OpenAI.js";
import vision from "@google-cloud/vision";
import { openai } from "../utils/OpenAI.js";
import { configDotenv } from "dotenv";
configDotenv();

const summarizer = asyncHandler(async (req, res) => {
    let { topic, level } = req.body;
    
    // Validate inputs
    if (!topic || topic.trim() === "") {
        throw new ApiError(400, "Please provide a topic to study");
    }
    
    if (!level || level.trim() === "") level = "Medium";

    // ULTIMATE CBSE LAST-MINUTE REVISION PROMPT
    const revisionPrompt = `You are a CBSE exam expert helping a student revise ONE NIGHT BEFORE THE EXAM.

**Topic:** "${topic}"
**Detail Level:** ${level} (Short = Quick revision, Medium = Balanced, Long = Deep coverage)

Your mission: Create the PERFECT last-minute revision guide for "${topic}" that maximizes exam marks.

Return ONLY valid JSON (no markdown, no extra text):
{
  "quickSummary": "${level === 'Short' ? '1-2 short paragraphs' : level === 'Medium' ? '2-3 paragraphs' : '3-4 detailed paragraphs'} explaining ${topic} using simple language and relatable examples. Make it easy to recall under exam pressure. Use everyday analogies.",
  
  "mustKnowPoints": [
    "Definition - in exact exam language (1 line)",
    "Formula/Theorem - with clear explanation (1 line)",
    "Key concept 1 - simplified (1 line)",
    "Important application/example (1 line)",
    "${level === 'Short' ? '4-6 points' : level === 'Medium' ? '6-8 points' : '8-12 points'} total - ONLY essentials that score marks"
  ],
  
  "memoryTricks": [
    "Mnemonic/Acronym - catchy way to remember main formula or concept",
    "Visual trick - simple analogy or real-world connection",
    "Pattern/Shortcut - quick way to solve or recall",
    "${level === 'Short' ? '2-3 tricks' : level === 'Medium' ? '3-4 tricks' : '4-6 tricks'} that make ${topic} stick instantly"
  ],
  
  "examIntelligence": {
    "chanceOfComing": "High/Medium/Low - Based on CBSE question paper trends and weightage",
    "whyItMatters": "1-2 lines explaining why this topic is important for marks",
    "commonQuestionFormats": [
      "Format 1: e.g., 'Derive the formula' or 'Define and explain'",
      "Format 2: e.g., 'Solve numerical' or 'Compare and contrast'",
      "Format 3: e.g., 'Draw diagram and label' or 'Give examples'",
      "List 3-4 actual question patterns from CBSE papers"
    ],
    "marksDistribution": "Usually X marks (1/2/3/5) - mention typical marking",
    "timeToSpend": "Y-Z minutes per question in exam",
    "examinerLooksFor": ["Keyword 1 they want to see", "Point 2 that gets marks", "Common thing students miss"]
  },
  
  "answeringStrategy": {
    "perfectAnswerStructure": "Step-by-step: Introduction → Point 1 → Point 2 → Example → Conclusion OR whatever format scores max marks",
    "mustInclude": ["Critical keyword 1", "Formula/definition", "Diagram/example if applicable"],
    "instantMarkLoss": ["Mistake 1 students make", "Thing 2 to never forget", "Error 3 that costs marks"],
    "proTips": ["Tip 1 for full marks", "Trick 2 for speed", "Hack 3 examiners love"]
  },
  
  "practiceQuestions": [
    {
      "question": "Most frequently asked 5-mark question on ${topic}",
      "marks": "5",
      "answerFormat": "**Introduction:** One line setting context\n**Point 1:** Explanation with formula\n**Point 2:** Application or example\n**Point 3:** Key insight or derivation\n**Conclusion:** Summary line\n\n(Show EXACT bullet/paragraph format)",
      "magicWords": "Keywords that guarantee marks: [word1, word2, word3]",
      "commonMistake": "What 80% students do wrong here"
    },
    {
      "question": "Typical 3-mark question variation",
      "marks": "3",
      "answerFormat": "• Point 1 with explanation\n• Point 2 with example\n• Point 3 with conclusion",
      "magicWords": "Must-use terms: [word1, word2]",
      "commonMistake": "Error to avoid"
    },
    "${level === 'Short' ? '2 questions' : level === 'Medium' ? '3 questions' : '4-5 questions'} covering different question types"
  ],
  
  "last10MinutesDrill": [
    "□ Memorize: [This exact formula/definition]",
    "□ Visualize: [This diagram/concept]",
    "□ Remember: [These 3 keywords for answer]",
    "□ Don't confuse: [This with that similar concept]",
    "${level === 'Short' ? '3-4 items' : level === 'Medium' ? '4-5 items' : '5-7 items'} - Quick scan checklist before entering exam hall"
  ]
}

CRITICAL INSTRUCTIONS:
1. Keep language SUPER SIMPLE - like explaining to a friend at 2 AM
2. Everything must be EXAM-READY and ACTIONABLE
3. Use CBSE answer writing style and marking scheme language
4. Include memory tricks that ACTUALLY WORK (not generic "understand the concept")
5. Show answers EXACTLY as they should appear on answer sheet
6. Focus on HIGH-YIELD content - what scores maximum marks
7. Make "examIntelligence" section data-driven based on CBSE patterns
8. In "answeringStrategy", give SPECIFIC tips, not vague advice
9. Practice questions should have REAL answer formats with proper structure
10. Everything should help a panicked student score marks FAST

Detail Level Guidance:
- Short: Quick essentials, 2-3 questions, focus on most probable content
- Medium: Balanced coverage, 3-4 questions, good tricks and strategies  
- Long: Comprehensive, 4-5 questions, deep tricks, multiple formats

Remember: This student has ONE NIGHT. Make every word count for marks! 🎯`;

    // Call OpenAI API
    const apiData = await askOpenAI(revisionPrompt);

    let revisionGuide;
    try {
        const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        revisionGuide = JSON.parse(cleaned);

        // Validate structure
        if (!revisionGuide.quickSummary || !revisionGuide.mustKnowPoints || 
            !revisionGuide.memoryTricks || !revisionGuide.examIntelligence || 
            !revisionGuide.answeringStrategy || !revisionGuide.practiceQuestions || 
            !revisionGuide.last10MinutesDrill) {
            throw new Error("Invalid response structure - missing required fields");
        }
    } catch (error) {
        throw new ApiError(500, "Failed to parse AI response: " + error.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            { data: revisionGuide }, 
            "Last-Minute Revision Guide Ready! 🎯"
        )
    );
});

const topperStyleAnswer = asyncHandler(async (req, res) => {
  const { user_question, selectedClass, selectedSubject, selectedChapter } = req.body;

  const prompt = `You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to write full-mark answers exactly the way toppers write in their exam notebooks — clean, simple, direct, and only what is required to score full marks.


STRICT LANGUAGE RULE:
If the subject is Hindi  → then deep read the chapter first then answer the question ONLY in Hindi.
If the subject is Sanskrit  → then deep read the chapter first then answer the question ONLY in Sanskrit and must strictly answer in 3 lines only, it can less then 3 but not more than 3 strictly.
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

Language Subject Rules: 
- If subject is hindi then deep read the chapter then answer the question in hindi only
- If subject is Sanskrit then first read the chapter then answer 2-3 lines if possible not more than this. It should be simple and concise 
Rules:
- Start the answer directly using the main concept asked in the question — no introduction, no background story.
- Keep the language simple and crisp — not bookish, not heavy, not long.
- Include formulas, steps, diagrams, tables, or bullet points ONLY when they improve scoring — do NOT force them.
- Do NOT explain extra theory that is not needed to score marks.
- Bold only very important keywords and terms — not the whole line.
- Maintain natural flow like exam writing, not like a textbook.

Special case — derivation / numerical / maths questions:
- Do NOT add theory or definition.
- Do NOT write introduction or conclusion.
- Only write the required steps and expressions that lead to the final result.
- Keep everything as compact as toppers write.
- ALL formulas inside $$...$$ must contain ONLY mathematical expressions — NO units, NO words, NO direction, NO sentences. Write units or explanation OUTSIDE the $$ formula $$ on the next line.

If any formula contains \\frac, \\sqrt, powers, subscripts, Greek letters or scientific symbols, ALWAYS write them using standard LaTeX syntax (for example \\alpha, \\mu, \\Omega, \\theta, \\Delta — NOT /alpha or /Omega) and wrap the entire formula in $$ ... $$.

Output safety:
- LaTeX formulas must be wrapped in $...$ or $$...$$.
- No markdown headings (#), no backticks, no JSON, no code formatting.
- No phrases like "Final Answer:", "Explanation:", "According to the question", etc.
- If you break any of these output rules, rewrite the answer again until ALL rules are satisfied.

❗Very important: NEVER write formulas inside normal brackets like ( V ), ( V_s ), ( Phi ), ( N ). Every mathematical symbol MUST be written ONLY inside $...$ or $$...$$ LaTeX format.

Goal: A topper-style answer that is short, neat, direct, and guaranteed full marks — without unnecessary information.

ADDITIONAL VALIDATIONS (EXTREMELY IMPORTANT):
✔️ If the question has multiple parts, YOU MUST answer ALL parts one-by-one. No skipping.
✔️ Every heading MUST be followed by proper explanation — NEVER give empty headings.
✔️ If the question includes "Explain", "Define", "List", or "Write properties/advantages/characteristics", YOU MUST give clear points.
✔️ Minimum 4 points whenever properties/advantages/characteristics are asked.
✔️ Do NOT stop until the ENTIRE question is fully answered.
✔️ Every mathematical formula MUST be written inside $ ... $ only.
❌ Never use brackets like ( \\vec{E} ), [ \\vec{E} ], or \\( \\vec{E} \\).
❌ Never escape slashes like \\\\vec or \\ldots.

Correct format example: $\\vec{E} = \\frac{1}{4 \\pi \\epsilon_0} \\frac{q}{r^2}$

DOUBLE-CHECK formula formatting before generating the final answer.

✔️ Every formula involved in derivations MUST be written in display math using $$ ... $$ (not inline $...$).
✔️ Each equation in a derivation must be on a separate line using its own $$ block.
✔️ Never write multiple formulas in one $$ block.

BEFORE sending the final answer:
🟢 Double-check that every part of the question is answered completely.
🟢 Double-check that no heading is without its explanation.

OUTPUT: Only the topper-style answer. Nothing else.

Now answer the question: 
Question: ${user_question}
class: ${selectedClass}
subject: ${selectedSubject}
chapter: ${selectedChapter}
`;

  const safePrompt = prompt.replace(/\\/g, "\\\\");
  const apiData = await askOpenAI(safePrompt, "gpt-5.1");

  return res.status(200).json(
    new ApiResponse(200, { answer: apiData }, "Answer generated successfully!")
  );
});


const importantQuestionGenerator = asyncHandler(async (req, res) => {
    const { className, subject, chapter, index } = req.body;

    if ([className, subject, chapter].some((f) => !f || f.trim() === "")) {
        throw new ApiError(400, "className, subject, chapter are required!");
    }

    const topics = Array.isArray(index) && index.length > 0 ? JSON.stringify(index) : "All key topics";

    const prompt = `
You are a CBSE Exam Expert. Generate ONLY HIGH-VALUE QUESTIONS that come frequently in CBSE Boards.

Return **VALID JSON only** (no markdown, no backticks).

INPUT:
Class: ${className}
Subject: ${subject}
Chapter: ${chapter}
Topics: ${topics}

OUTPUT JSON STRUCTURE:
{
  "chapter": "<chapter name>",
  "whyImportant": "<2 lines explaining why this chapter is important for exam>",
  
  "pastYearPatterns": [
    {
      "questionType": "1-mark | 2-mark | 3-mark | 5-mark",
      "frequency": "High | Medium | Low",
      "trend": "How often asked in last 5 years",
      "notes": "short insight"
    }
  ],

  "importantQuestions": [
    {
      "question": "<Most expected question>",
      "marks": "<1/2/3/5>",
      "whyThisIsImportant": "<1–2 lines>",
      "keywords": ["keyword1", "keyword2"],
      "modelAnswer": "<Simple English answer written exactly like exam>"
    }
  ],

  "mustPracticeNumericals": [
    {
      "question": "<numerical question if subject needs>",
      "marks": "<2/3/5>",
      "formulaUsed": ["formula1", "formula2"],
      "solutionSteps": "Step 1: ... Step 2: ... Step 3: ...",
      "commonMistake": "<common student mistake>"
    }
  ],

  "veryShortQuestions": [
    {
      "question": "<1 mark conceptual question>",
      "answer": "<crisp answer>",
      "keywords": ["term1"]
    }
  ],

  "longAnswerQuestions": [
    {
      "question": "<expected 5-mark or derivation question>",
      "structure": "Intro → Point 1 → Point 2 → Diagram → Conclusion",
      "modelAnswer": "<full answer student can copy>",
      "diagramTip": "<if diagram needed>"
    }
  ],

  "examStrategy": {
    "howToAttempt": ["tip1", "tip2"],
    "mustRevise": ["topic1", "topic2"],
    "avoidMistakes": ["mistake1", "mistake2"]
  }
}

Requirements:
- Minimum 20 important questions.
- All answers in simple CBSE-friendly language.
- No complex words.
- All JSON must be strictly valid.
`;

    // CALL OPENAI
    const apiData = await askOpenAI(prompt);

    let finalQuestions;
    try {
        const clean = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        finalQuestions = JSON.parse(clean);

        const required = [
            "chapter",
            "whyImportant",
            "pastYearPatterns",
            "importantQuestions",
            "veryShortQuestions",
            "longAnswerQuestions",
            "examStrategy"
        ];

        const missing = required.filter(f => !finalQuestions[f]);
        if (missing.length > 0) {
            throw new Error("Missing required fields: " + missing.join(", "));
        }

    } catch (err) {
        throw new ApiError(500, "Failed to parse AI response: " + err.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: finalQuestions },
            "Important Question Set Generated Successfully! 🔥"
        )
    );
});

const quizMcqFillupTrueFalse = asyncHandler(async (req, res) => {
    const { className, subject, chapter, index } = req.body;

    if (!className || !subject || !chapter) {
        throw new ApiError(400, "className, subject and chapter are required");
    }

    const topics = Array.isArray(index) && index.length > 0 ? JSON.stringify(index) : "All key topics";

    const prompt = `
You are a CBSE Exam Expert. Generate ONLY HIGH-VALUE questions from the chapter.
Include MCQs, Fillups, and True/False with answers.

INPUT:
- Class: ${className}
- Subject: ${subject}
- Chapter Name: ${chapter}
- Topics: ${topics}

REQUIREMENTS:
1. Generate 15 to 20 VERY IMPORTANT questions in total.
2. Include all 3 types:
   - "mcq" (minimum 7)
   - "fillup" (minimum 5)
   - "true_false" (minimum 4)
3. MCQs: Provide 4 options and correct answer exactly matching one option.
4. Fillups: Use blank as "______".
5. True/False: Answer must be "True" or "False".
6. Do NOT repeat questions.
7. Return STRICT JSON ONLY. No markdown, no explanations.

OUTPUT FORMAT:
{
  "class": "${className}",
  "subject": "${subject}",
  "chapter": "${chapter}",
  "questions": [
    {
      "id": 1,
      "type": "mcq | fillup | true_false",
      "question": "<question text>",
      "options": ["A", "B", "C", "D"],
      "answer": "<correct answer>"
    }
  ]
}
`;

    // Call OpenAI using your helper
    const apiData = await askOpenAI(prompt);

    let finalQuestions;
    try {
        const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        finalQuestions = JSON.parse(cleaned);

        // Validate required fields
        const requiredFields = ["class", "subject", "chapter", "questions"];
        const missingFields = requiredFields.filter((f) => !finalQuestions[f]);
        if (missingFields.length > 0) {
            throw new Error("Missing required fields: " + missingFields.join(", "));
        }

        if (!Array.isArray(finalQuestions.questions) || finalQuestions.questions.length === 0) {
            throw new Error("Questions array is empty or invalid");
        }

    } catch (err) {
        console.error("❌ AI Response Parsing Error:", err);
        throw new ApiError(500, "Failed to parse AI response: " + err.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: finalQuestions },
            "MCQs + Fillups + True/False generated successfully 🔥"
        )
    );
});

const askAnyQuestion = asyncHandler(async (req, res) => {
    const { question } = req.body;

    if (!question || question.trim() === "") {
        throw new ApiError(400, "Please provide a question or topic");
    }

    const prompt = `
You are a CBSE Exam Expert. Answer the following question in SIMPLE, CLEAR English
so that a student can write it EXACTLY in exams.

**Question/Topic:** "${question}"

CRITICAL RULES:
1. Provide a COMPLETE, DETAILED answer that covers all aspects of the question.
2. Use simple words, short sentences, clear meaning.
3. Detect the likely marks for this question (1, 2, 3, 5, 6) based on typical CBSE trends.
4. The answer length must be COMPREHENSIVE and DETAILED based on marks:
   - 1–2 marks → 2–3 lines with clear explanation
   - 3 marks → 4–6 lines or 4–5 detailed bullet points with explanations
   - 5–6 marks → 8–12 lines or 6–8 detailed points with proper explanation, examples, and reasoning
5. Include proper definitions, explanations, examples, and reasoning where needed.
6. For definitions: give the definition + brief explanation + example if possible.
7. For descriptive answers: cover all key points thoroughly with proper elaboration.
8. For numerical/derivations: show complete steps with explanations.
9. Make sure the answer is exam-ready and helps student score FULL marks.
10. If the question requires a formula, include it exactly in the "formula" field.
11. Return ONLY valid JSON like this:

{
  "answer": "<detailed exam-ready answer with complete explanation>",
  "marks": "<1|2|3|5|6>",
  "formula": "<formula if applicable, else null>"
}

Make it detailed, thorough, scoring maximum marks, and exam-ready. DO NOT be too brief.
`;

    // Call OpenAI
    const apiData = await askOpenAI(prompt);

    let parsed;
    try {
        const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);

        if (!parsed.answer || !parsed.marks || parsed.formula === undefined) {
            throw new Error("Missing required fields 'answer', 'marks', or 'formula'");
        }

        // Ensure formula is null if not applicable
        if (!parsed.formula) parsed.formula = null;

    } catch (err) {
        throw new ApiError(500, "Failed to parse AI response: " + err.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: parsed },
            "Answer generated successfully."
        )
    );
});

const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const diagramImageAnalysis = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new ApiError(400, "Please upload image first!");
  }

  const prompt = "Analyze the following text extracted from the image:";
  const fileBuffer = req.files.image[0].buffer;

  try {
    const [result] = await client.documentTextDetection({ image: { content: fileBuffer } });
    const extractedText = result.fullTextAnnotation?.text || "";

    if (!extractedText) {
      throw new ApiError(400, "No text found in the image.");
    }

    const aiResponse = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: `${prompt}\n${extractedText}` },
          ],
        },
      ],
      max_output_tokens: 800,
    });

    return res.status(200).json({
      success: true,
      message: "Image analyzed successfully",
      extractedText,
      aiResponse: aiResponse.output[0].content,
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    throw new ApiError(500, error.message);
  }
});



export { summarizer, topperStyleAnswer, importantQuestionGenerator, quizMcqFillupTrueFalse,askAnyQuestion, diagramImageAnalysis};