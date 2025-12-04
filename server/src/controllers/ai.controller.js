import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askOpenAI ,openai } from "../utils/OpenAI.js";
import { configDotenv } from "dotenv";
import { PyqModel } from "../models/PreviousYearQuestions/pyq.model.js";
import { parseSubject } from "../utils/helper.js";
import { McqModel } from "../models/ImportantMcqsTrueFalse/mcq.model.js";
import { ImpQuestionModel } from "../models/ImportantQuestionsPage/impquestions.model.js";

configDotenv();

import vision from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../ocr-key.json"),
});


const summarizer = asyncHandler(async (req, res) => {
  const { topic, level } = req.body;

  // ✅ NEW VALIDATION ADDED
  if (
    (!topic || !topic.trim()) &&
    (!req.files || !req.files.image)
  ) {
    throw new ApiError(400, "Either topic or image is required!");
  }

  let extractedText = "";
  let labels = [];
  let mode = "no_image";

  // ✅ REAL IMAGE (OPTIONAL)
  if (req.files && req.files.image) {
    let fileBuffer = req.files.image[0].buffer;

    try {
      fileBuffer = await sharp(fileBuffer).png().toBuffer();
    } catch (e) {
      throw new ApiError(400, "Invalid image file");
    }

    const [textResult] = await client.textDetection({
      image: { content: fileBuffer },
    });

    extractedText = textResult.fullTextAnnotation?.text || "";

    const [labelResult] = await client.labelDetection({
      image: { content: fileBuffer },
    });

    labels = (labelResult.labelAnnotations || [])
      .map((x) => x.description)
      .slice(0, 5);

    if (extractedText.trim()) mode = "text";
    else if (!extractedText.trim() && labels.length) mode = "label_only";
    else mode = "fallback";
  }

const prompt = `
You are a CBSE Board expert teacher and examiner. Think internally but DO NOT show your thinking.

Your task depends on whether an IMAGE is uploaded or only a TOPIC is given.

----------------------------------
IF IMAGE IS PRESENT:
----------------------------------
Your PRIMARY task is to:
1. First understand what the image contains:
   - Diagram
   - Numerical problem
   - Theory question
   - Graph / Map
   - Flowchart / Process
2. Then explain EVERYTHING shown in the image clearly and fully.
3. If the image contains a QUESTION:
   - You MUST solve it step-by-step exactly how a CBSE topper writes in the exam.
   - Show proper steps, formulas (inside $$ only), reasoning and final answer.
4. If the image contains a DIAGRAM:
   - Explain each labelled part clearly.
   - Explain the concept behind it.
   - Add 1 short memory trick.
5. If the image contains THEORY:
   - Explain it in clean, easy and exam-perfect language.

Use the Level rule:
- Short → crisp exam-ready explanation.
- Medium → clear concept + small examples if needed.
- Long → full detailed CBSE topper-level explanation.

The student must understand the topic PERFECTLY after reading.
They must NOT need YouTube or any other source after this.

----------------------------------
IF ONLY TOPIC IS PRESENT:
----------------------------------
Generate a perfect CBSE-oriented topic explanation.

Start directly with the concept.
Explain in a teacher’s clean classroom style.
Concept → key points → formulas (if any) → 1 short example (if needed).

----------------------------------
INPUT DATA:
----------------------------------
Topic: ${topic || "From Image"}
Length Type: ${level}

Image Analysis Mode: ${mode}

Extracted Image Text:
${extractedText || "(none)"}

Detected Image Labels:
${labels.join(", ") || "(none)"}

----------------------------------
LENGTH RULES (STRICT):
----------------------------------
- Short → EXACT 4–5 short exam lines.
- Medium → 10–12 clear lines.
- Long → Full detailed CBSE exam-ready answer.

----------------------------------
LANGUAGE RULE:
----------------------------------
If subject is Hindi → answer ONLY in Hindi.
If subject is Sanskrit → answer ONLY in Sanskrit (2–3 lines).
Otherwise → answer ONLY in English.

----------------------------------
FORMULA RULES (VERY STRICT):
----------------------------------
- ALL formulas must be inside $$ ... $$ only.
- NO text or units inside $$.
- No (V), (I), (Phi), etc.
- Use \\phi, \\theta, \\vec{E}, \\frac, \\sqrt, etc.
- Never escape slashes like \\\\vec.
- Never put two formulas in one $$ block.

----------------------------------
EXAM WRITING STYLE:
----------------------------------
- Step-by-step where required.
- Clean points.
- No extra theory.
- No storytelling.
- No filler lines.
- Exactly how a CBSE topper writes to score full marks.

----------------------------------
HARD FORMATTING RULE (VERY STRICT):
----------------------------------
- You MUST write the answer in MULTIPLE clear lines.
- NEVER write the full answer in a single paragraph.
- Each important step / point MUST be on a new line.
- For:
  • Short → Minimum 4 separate lines.
  • Medium → Minimum 8 separate lines.
  • Long → Many structured lines.
- If this rule is violated, the answer is considered WRONG and must be regenerated.

----------------------------------
STRICT OUTPUT RULES:
----------------------------------
- No headings like “Explanation”.
- No markdown.
- No code blocks.
- No JSON.
- Only the final explanation / solution.

FINAL CHECK:
✔ Topic or Image fully covered.
✔ Student can understand without any external help.
✔ CBSE exam-ready.
✔ Formulas formatted correctly.
✔ Length rule followed.

OUTPUT: Only the final explanation or solved answer. Nothing else.
`;


  const safePrompt = prompt.replace(/\\/g, "\\\\");

  const aiData = await openai.responses.create({
    model: "gpt-4o",
    input: safePrompt,
    max_output_tokens: 800,
  });

  let cleanedOutput = aiData.output_text
    .replace(/\r/g, "")
    .replace(/[\u200B-\u200F\uFEFF]/g, "")
    .replace(/^[ \t]+$/gm, "")
    .replace(/^\s*\n/gm, "\n")
    .replace(/\n{3,}/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  return res.status(200).json(
    new ApiResponse(200, cleanedOutput, "Summary generated successfully!")
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
    const {mainSubject, bookName} = parseSubject(subject);

    if ([className, subject, chapter].some((f) => !f || f.trim() === "")) {
        throw new ApiError(400, "className, subject, chapter are required!");
    }

    const topics = Array.isArray(index) && index.length > 0 ? JSON.stringify(index) : "All key topics";

    const prompt = `
You are a CBSE Exam Expert. First read the ncert chapter first that is provided in deeply. Think deeply do not show it. Generate ONLY HIGH-VALUE QUESTIONS that come frequently in CBSE Boards.

Return **VALID JSON only** (no markdown, no backticks).

INPUT:
Class: ${className}
Subject: ${subject}
Chapter: ${chapter}
Topics: ${topics}

NCERT BOOK NAME: ${bookName}

OUTPUT JSON STRUCTURE:
{
  "chapter": "<chapter name>",
  "whyImportant": "<2 lines explaining why this chapter is important for exam>",
  
 
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
- Minimum 10 important questions.
- All answers in simple CBSE-friendly language.
- No complex words.
- All JSON must be strictly valid.
`;

     const cache = await ImpQuestionModel.findOne({
      className,
      subject:mainSubject,
      chapter
    })

    if(cache) {
      return res.status(200).json(new ApiResponse(200,{data:cache.content},"Important Questions Generated Successfully"))
    }
    
    // CALL OPENAI
    const apiData = await askOpenAI(prompt);

    let finalQuestions;
    try {
        const clean = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        finalQuestions = JSON.parse(clean);

        const required = [
            "chapter",
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

      await ImpQuestionModel.create({
      className,
      subject:mainSubject,
      chapter,
      content:finalQuestions,
    })

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
    const {mainSubject, bookName} = parseSubject(subject);

    if (!className || !subject || !chapter) {
        throw new ApiError(400, "className, subject and chapter are required");
    }

    const topics = Array.isArray(index) && index.length > 0 ? JSON.stringify(index) : "All key topics";

    const prompt = `
You are a CBSE Exam Expert. Generate ONLY HIGH-VALUE questions from the chapter.
Include MCQs, Fillups, and True/False with answers.

INPUT:
- Class: ${className}
- Subject: ${mainSubject}
- Chapter Name: ${chapter}
- Topics: ${topics}
- Bookname: ${bookName}

STRICT GENERATION RULES:
1. Generate 15 to 20 VERY IMPORTANT questions in total.
2. Must include all 3 types:
   - "mcq" → minimum 7
   - "fillup" → minimum 5
   - "true_false" → minimum 4

3. MCQ Rules:
   - Must contain EXACTLY 4 options.
   - "answer" must MATCH one of the options EXACTLY.
   - No empty options, no missing options.

4. Fillups Rules:
   - Use blank as "______".
   - "answer" MUST be provided and must NOT be empty.
   - Do NOT generate fillups without answers under any condition.

5. True/False Rules:
   - Must contain ONLY "True" or "False" in the "answer" field.
   - NO other words allowed.

6. ABSOLUTELY NO missing fields.
   Every question object MUST have:
   - id
   - type
   - question
   - answer
   - options (only for mcq, ALWAYS 4 items)
   If any field is missing, regenerate the ENTIRE JSON again.

7. Do NOT repeat ANY question.
8. Do NOT add explanations.
9. Return STRICT JSON ONLY. No markdown, no codeblock, no comments.

FINAL OUTPUT FORMAT (STRICT):
{
  "class": "${className}",
  "subject": "${subject}",
  "chapter": "${chapter}",
  "questions": [
    {
      "id": 1,
      "type": "mcq" | "fillup" | "true_false",
      "question": "<question text>",
      "options": ["A", "B", "C", "D"],   // Only for mcq
      "answer": "<correct answer>"
    }
  ]
}

FINAL VALIDATION CHECK (MANDATORY):
- If any answer field is missing or empty → REGENERATE FULL JSON.
- If any fillup does not contain an answer → REGENERATE FULL JSON.
- If any mcq option is missing or not exactly 4 → REGENERATE FULL JSON.
- If "answer" for True/False is not EXACTLY "True" or "False" → REGENERATE FULL JSON.
- If any required field is missing → REGENERATE FULL JSON.

RETURN ONLY THE FINAL VALID JSON.
`;
    const cache = await McqModel.findOne({
      className,
      subject:mainSubject,
      chapter
    })

    if(cache) {
      return res.status(200).json(new ApiResponse(200,{data:cache.content},"Mcqs Generated Successfully"))
    }
    
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
        console.error("AI Response Parsing Error:", err);
        throw new ApiError(500, "Failed to parse AI response: " + err.message);
    }

    await McqModel.create({
      className,
      subject:mainSubject,
      chapter,
      content:finalQuestions,
    })

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
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to write full-mark answers exactly the way toppers write in their exam notebooks — clean, simple, direct, and only what is required to score full marks.


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

✔ FIX ADDED (Spacing Rule — does NOT change original prompt):
- NEVER add extra blank lines.
- NEVER use double line breaks. Only one line break is allowed between points.
- Output must not contain unnecessary empty space.

OUTPUT: Only the topper-style answer. Nothing else.

Now answer the question: 
Question: ${question}
`;


  const safePrompt = prompt.replace(/\\/g, "\\\\");
  const apiData = await askOpenAI(safePrompt, "gpt-5.1");

    return res.status(200).json(
        new ApiResponse(
            200,
            { answer: apiData },
            "Answer generated successfully."
        )
    );
});

// Generate PYQS
const generatePYQs = asyncHandler(async (req, res) => {
    const { className, subject, chapter, year } = req.body;
     const { mainSubject, bookName } = parseSubject(subject);
    if (!className || !subject || !chapter || !year) {
        throw new ApiError(400, "className, subject, chapter and year are required");
    }

    const prompt = `
You are a CBSE PYQ Expert. Your ONLY task is to generate synthetic but accurate
CBSE-style PYQs for ONE specific year provided by the user.

USER INPUT:
- Class: ${className}
- Subject: ${subject}
- Chapter: ${chapter}
- Year: ${year}

STRICT GENERATION RULES:
1. Generate **10 to 15 high-value PYQs** for the given year ONLY.
2. For EACH question include ALL fields:
   - "id"
   - "year" → MUST be exactly ${year}
   - "marks" → 1, 2, 3, or 5 ONLY
   - "question" → Must be meaningful and chapter-focused
3. NO repeated questions.
4. ABSOLUTELY NO missing fields.
5. NO explanation, NO commentary.
6. Return STRICT JSON ONLY — NO markdown, NO extra text.

MANDATORY VALIDATION:
If ANY of the following occur → regenerate full JSON:
- year field is not exactly ${year}
- marks is missing or not 1/2/3/5
- id missing
- question missing
- any field empty
- more or fewer than 10–15 questions

THIS IS THE NCERT BOOKNAME FOR YOUR REFERENCE
- ${bookName}

FINAL OUTPUT FORMAT:
{
  "class": "${className}",
  "subject": "${subject}",
  "chapter": "${chapter}",
  "year": ${year},
  "pyqs": [
    {
      "id": 1,
      "year": ${year},
      "marks": 3,
      "question": "Explain the role of …"
    }
  ]
}

RETURN STRICT JSON ONLY.
    `;

        const cache = await PyqModel.findOne({
      className,
      subject:mainSubject,
      chapter,
      year,
    })

    if(cache) {
      return res.status(200).json(new ApiResponse(200,{data:cache.content},"Pyqs Fetched Successfully"))
    }

    // Call AI
    const aiResponse = await askOpenAI(prompt,"gpt-5.1");

    // Clean JSON
    let finalJson;
    try {
        const cleaned = aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        finalJson = JSON.parse(cleaned);

    
    } catch (err) {
        console.error("❌ AI JSON Error:", err);
        throw new ApiError(500, "Failed to parse PYQ JSON: " + err.message);
    }

      await PyqModel.create({
      className,
      subject:mainSubject,
      chapter,
      content:finalJson,
      year
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: finalJson },
            "PYQs fetched successfully! 🎯"
        )
    );
});


export { summarizer, topperStyleAnswer, importantQuestionGenerator, quizMcqFillupTrueFalse,askAnyQuestion, generatePYQs};