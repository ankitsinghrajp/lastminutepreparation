// Feature - 	Description
// Smart Chapter Summary -	AI generates crystal-clear, exam-oriented summaries — no extra info, only what helps in marks.
// 6 Most Important Questions - Auto-detects the highest-probability questions for the board exam from that chapter.
// Short Notes (Toppers Style) - Bullet-point notes written exactly like toppers write in exams.
// Mind Map / Flowchart -	Visual diagrams for each chapter — helps in revision in 2 minutes.
// Formula Sheet / Key Terms -	All formulas, definitions, theorems, dates, character sketches in one place.
// Doubt Solver - Ask ANY doubt from that chapter → AI answers with step-by-step explanation.

import { redis } from "../libs/redis.js";
import { ChapterWiseImportantQuestionModel } from "../models/chapterWiseStudy/chapterWiseImportantQuestion.model.js";
import { ChapterWiseMindMapModel } from "../models/chapterWiseStudy/chapterWiseMindMap.model.js";
import { ChapterWiseShortNotesModel } from "../models/chapterWiseStudy/chapterWiseShortNotes.model.js";
import { ChapterWiseSummaryModel } from "../models/chapterWiseStudy/chapterWiseSummary.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectCategory, parseSubject } from "../utils/helper.js";
import { askOpenAI } from "../utils/OpenAI.js";

const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Extract only JSON object
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON found.");

  let jsonString = text.substring(first, last + 1);

  // ❌ REMOVE THIS (breaking newlines)
  // jsonString = jsonString.replace(/\\/g, "\\\\");

  // Keep only this to clean invisible control chars
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};

const smartChapterSummary = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Key
  const cacheKey = `lmp:smartsummary:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "Summary Ready (Cached)"));
      }

      if (typeof redisCached === "string") {
        return res
          .status(200)
          .json(
            new ApiResponse(200, JSON.parse(redisCached), "Summary Ready (Cached)")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // 2️⃣ PROMPT (EXACT — UNTOUCHED)
  let prompt = "";

  if (category === "language") {
    prompt = `
You are an API. Think silently but DO NOT show your internal thinking.

First, internally understand the content of the given NCERT chapter(s) or poem(s) as if you have fully read them. Do NOT mention this step in the output.

STRICT LANGUAGE RULE:
If the subject is Hindi or Sanskrit → answer ONLY in Hindi.
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

IMPORTANT:
If the chapter/poem name contains "/", it means there are TWO different poems/chapters. They must be summarized SEPARATELY — never together, never merged.

Your task:
✔ If there is ONE poem/chapter → write its summary in 2–3 paragraphs (each paragraph 5–6 simple lines).
✔ If there are TWO poems/chapters (detected using "/"):
     → First poem/chapter only → 2–3 paragraphs (5-6 simple lines each)
     → Leave ONE real blank line (press ENTER twice so there is a real empty line)
     → Second poem/chapter only → 2–3 paragraphs (5-6 simple lines each)

HARD RULES (non-negotiable):
✔ NO combining or comparing both poems/chapters
✔ Do NOT mention that there are two poems/chapters
✔ Do NOT include titles, headings, names, or section labels such as "First poem", "Second poem", etc.
✔ Just write the first summary → blank line → second summary

✔ USE REAL BLANK LINES ONLY:
  - The summary text INSIDE the JSON value MUST include actual newline characters (U+000A).
  - Do NOT output the two-character sequence backslash + n (that is, do NOT output "\\n" or "\\n\\n" anywhere).
  - Do NOT escape newlines as literal backslash sequences. Use real Enter key line breaks.
  - Do NOT include backslash characters immediately before the letter n (no \\n anywhere).
  - The blank line between summaries must be produced by pressing ENTER twice (one empty line between paragraphs).

✔ No bullet points, no numbering, no bold/italics, no emojis, no formulas, no quotes, no author names
✔ Only clean plain text in paragraphs

Return output ONLY in this JSON format:
{
  "summary": "Final summaries with real blank lines (use actual newlines; do not use backslash-n sequences)"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`;
  } else {
    prompt = `
You are an API. Think silently but DO NOT show your internal thinking.

Write a short NCERT-style chapter summary in **5-6 simple lines** only.
It must be crisp, student-friendly, and useful for last-minute revision.

❌ Do NOT include formulas, numericals, derivations, diagrams, definitions, tables, or headings.
❌ Do NOT use bullet points, lists, or line breaks after every sentence.
✔ The summary must be a **single flowing paragraph of 5-6 lines** only.

Return output in JSON format ONLY:
{
  "summary": "5-6 line paragraph here"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`;
  }

  // 3️⃣ CHECK DATABASE CACHE
  const dbSummary = await ChapterWiseSummaryModel.findOne({
    className,
    subject: mainSubject,
    chapter,
  });

  if (dbSummary) {
    const safeDBContent = JSON.parse(JSON.stringify(dbSummary.content));

    // Store inside Redis
    await redis.set(cacheKey, JSON.stringify(safeDBContent), {
      ex: 60 * 60 * 24 * 2, // 2 DAYS
    });

    return res.status(200).json(
      new ApiResponse(200, safeDBContent, "Summary Ready (DB Cache)")
    );
  }

  // 4️⃣ CALL OPENAI
  let output = await askOpenAI(prompt);
  const parsed = extractJSON(output);

  const safeParsed = JSON.parse(JSON.stringify(parsed));

  // 5️⃣ SAVE TO DB
  await ChapterWiseSummaryModel.create({
    className,
    subject: mainSubject,
    chapter,
    content: safeParsed,
  });

  // 6️⃣ SAVE TO REDIS
  await redis.set(cacheKey, JSON.stringify(safeParsed), {
    ex: 60 * 60 * 24 * 2, // 2 DAYS
  });

  return res.status(200).json(new ApiResponse(200, safeParsed, "Summary Ready"));
});


const chapterWiseShortNotes = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);

  // Redis Key
  const cacheKey = `lmp:shortnotes:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE FIRST
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash REST returns objects, but your value is plain string
      if (typeof redisCached === "string") {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { shortNotes: redisCached },
              "Short Notes Ready (Cached)"
            )
          );
      }

      // If by chance object, still convert to string
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { shortNotes: redisCached.shortNotes || redisCached },
              "Short Notes Ready (Cached)"
            )
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }


  // 2️⃣ ORIGINAL PROMPT — EXACT, NOT TOUCHED
  const prompt = `You are a CBSE Board exam expert. Think internally first but DO NOT show your thinking.

Your ONLY task is to generate SHORT NOTES for the given chapter exactly like toppers write: clean, crisp, scoring, and technically perfect.

MOST IMPORTANT THING:
Ensure that all important topics should be covered in short notes.

STRICT LANGUAGE RULE:
• If subject is Hindi → Write ONLY in Hindi.
• If subject is Sanskrit → Write ONLY in Sanskrit.
• Otherwise → Write ONLY in English.

====================================================
ABSOLUTE OUTPUT RULES (DO NOT BREAK THESE)
====================================================

1) BULLET RULE:
• You MUST NOT use "• " or "- " at the beginning of any line.
• Instead, write clean short-note style points WITHOUT any symbols. Just simple lines.
• NO paragraphs, NO headings, NO intros, NO conclusions.
• No long paragraphs — only crisp, concise points.

2) FORMULA APPEARANCE RULE (CRITICAL):
• ANY mathematical expression (like F = …, E = …, V = …, Q/r^2, fractions, integrals)
  MUST ALWAYS appear ONLY inside its own $$ ... $$ block.
• NEVER write formulas as plain text inside points.
• If ANY formula appears outside $$ → REGENERATE immediately.

3) DISPLAY MATH FORMAT (MANDATORY):
Every formula MUST look EXACTLY like this:

(blank line)
$$
F = k \\frac{q_1 q_2}{r^2}
$$
(blank line)

4) INSIDE $$ RULES:
ALLOWED:
• \\frac
• \\sqrt
• \\int
• \\cdot
• \\epsilon_0
• Greek letters: \\alpha, \\beta, \\gamma, \\phi, \\theta, \\Phi
• Proper subscripts: q_1, Q_{enc}, r^2, A_{net}
• Superscripts using ^{ }

NOT ALLOWED:
• frac (without \\)
• sqrt (without \\)
• epsilon0, eps, epsilon
• ANY English words inside formulas
• ^2 without braces
• Multiple equations in one $$ block
• Equations inside (parentheses) like (E), (V), (Phi)
• **NEW RULE:** \\text{...} or ANY usage of \\text is strictly forbidden inside $$ blocks
• **NEW RULE:** Units (C, N, m, J, etc.) MUST NOT appear inside $$ blocks — they must be written outside the formula as plain text

5) AFTER $$ RULE:
• The VERY NEXT line MUST be a new short-note point (but WITHOUT "• " or "- ").
• NO normal text is allowed directly under $$ unless it is a point.

6) BRACES / BACKSLASH RULE:
• Every { must have matching }
• EVERY LaTeX command MUST begin with \\
• Phi → ❌ WRONG
• \\Phi → ✅ CORRECT

7) VALIDATION BEFORE OUTPUT (MANDATORY):
Before sending final answer, you MUST self-check:

✔ Every formula is inside its own $$ block  
✔ No formulas appear as plain text  
✔ No inline math ($...$) exists  
✔ No forbidden tokens (frac, sqrt, eps, epsilon0, text)  
✔ **NO \\text{...} inside formulas**  
✔ **NO units inside formulas**  
✔ All commands start with "\\"  
✔ Braces balanced  
✔ No trailing backslashes or incomplete commands  
✔ Blank line above AND below every formula  
✔ Proper point immediately after each $$ block  
✔ No English words inside $$ blocks

====================================================
FORMULA COMPLETENESS RULES (NEW — FIXES HALF / TRUNCATED FORMULAE)
====================================================

The model MUST perform these checks for each $$ ... $$ block and REGENERATE if any check fails:

1) Balanced $$ pairs:
   • The number of $$ tokens in the whole output must be even.
   • Each $$ must appear on its own line.

2) Single-equation per block:
   • Each $$ block MUST contain exactly one equation/expression.
   • No extra text or commentary inside.

3) Braces & parentheses completeness:
   • Count of '{' equals count of '}' inside each formula.
   • Count of '(' equals count of ')'.
   • If mismatch → REGENERATE.

4) No trailing backslash or incomplete command:
   • Formula MUST NOT end with a single "\\".
   • No "\\" followed only by whitespace or end-of-block.

5) No truncated LaTeX tokens:
   • Commands like \\fra, \\sq, \\epsil are forbidden.
   • \\frac must contain both numerator and denominator braces.

6) No stray backslash sequences:
   • "\\n", "\\t", etc. are forbidden inside $$.  

7) Minimum content sanity:
   • A formula must contain at least one operator (=, \\frac, ^, _, \\cdot, etc.).  

8) Blank-line placement:
   • One blank line above and one blank line below each formula.  
   • Then a short-note point immediately (without bullets).  

====================================================
ADDITIONAL INLINE MATH AND SANITIZATION VALIDATIONS (MANDATORY):

A. Parentheses to inline math:
1. You must never output Greek letters or variables inside plain parentheses such as (Phi), (phi), (p), (E), (V), (Phi_E).
   Convert them to inline math:
     (Phi)   -> $ \\Phi $
     (phi)   -> $ \\phi $
     (Phi_E) -> $ \\Phi_E $
     (p)     -> $ p $

B. Subscript and superscript rules:
1. Variables followed by digits must always use subscripts or exponents:
   q1 → q_1  
   q2 → q_2  
   r2 → r^{2}  
   r3 → r^{3}
2. Qenc → Q_{enc}

C. Greek letter normalization:
1. Greek names must start with backslash:
   Phi → \\Phi  
   phi → \\phi

Now generate the topper-style SHORT NOTES for:
Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
`;

  try {
    // 3️⃣ CHECK DATABASE CACHE
    const dbNotes = await ChapterWiseShortNotesModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbNotes) {
      const safeData = dbNotes.content;

      // Store to Redis for 2 days
      await redis.set(cacheKey, safeData, {
        ex: 60 * 60 * 24 * 2,
      });

      return res.status(200).json(
        new ApiResponse(200, { shortNotes: safeData }, "Short Notes Ready (DB Cache)")
      );
    }

    // 4️⃣ CALL AI
    const safePrompt = prompt.replace(/\\/g, "\\\\");
    const output = await askOpenAI(safePrompt, "gpt-5.1");

    // 5️⃣ SAVE TO DB
    await ChapterWiseShortNotesModel.create({
      className,
      subject: mainSubject,
      chapter,
      content: output,
    });

    // 6️⃣ SAVE TO REDIS (2 DAYS)
    await redis.set(cacheKey, output, {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { shortNotes: output }, "Short Notes Ready"));
  } catch (error) {
    console.error("Short Notes Generation Failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to generate Short Notes. Please try again."
        )
      );
  }
});



const chapterWiseMindMap = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);

  // Redis Cache Key
  const cacheKey = `lmp:mindmap:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash returns parsed object for JSON strings
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "MindMap Ready (Cached)"));
      }

      // fallback if string
      if (typeof redisCached === "string") {
        return res
          .status(200)
          .json(
            new ApiResponse(200, JSON.parse(redisCached), "MindMap Ready (Cached)")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET Error:", err);
  }

  // 2️⃣ PROMPT (UNTOUCHED)
  const prompt = `
You are a CBSE Board expert. Your ONLY task:

➡ Generate React-Flow compatible JSON mindmap for the chapter.

⚠ STRICT RULES:
Return ONLY valid JSON with EXACTLY:

{
  "nodes": [
    { "id": "1", "label": "Main Topic", "x": 0, "y": 0 }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

RULES FOR MINDMAP:
- "nodes" must be an array of objects:
    { id, label, x, y }
- "edges" must be an array of:
    { id, source, target }
- Node IDs MUST be unique numbers as strings: "1", "2", "3"...
- Parent node connects to child with edges.
- x/y coordinates must be auto-generated but simple layout:
    root → x:0,y:0
    children: x:300,y:(index*150)
    grandchildren: x:600,y:(index*150)

DATA RULES:
- Convert the entire chapter into:
    Root → Main topics → Subtopics
- Keep labels short and exam-friendly
- NO markdown
- NO backticks
- NO paragraphs
- NO extra explanation before or after JSON

Generate for:
Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
`;

  try {
    // 3️⃣ CHECK DATABASE CACHE
    const dbData = await ChapterWiseMindMapModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbData) {
      const safeDB = JSON.parse(JSON.stringify(dbData.content));

      // Store in Redis for 2 days
      await redis.set(cacheKey, JSON.stringify(safeDB), {
        ex: 60 * 60 * 24 * 2,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, safeDB, "MindMap Ready (DB Cache)"));
    }

    // 4️⃣ CALL OPENAI
    const raw = await askOpenAI(prompt);
    const parsed = extractJSON(raw);

    // Validate structure
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error("Invalid JSON from OpenAI");
    }

    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 5️⃣ SAVE TO DATABASE
    await ChapterWiseMindMapModel.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 6️⃣ SAVE TO REDIS
    await redis.set(cacheKey, JSON.stringify(safeParsed), {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "React Flow Mindmap Ready"));
  } catch (err) {
    console.error("Mindmap Generation Error:", err.message);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to generate mindmap"));
  }
});



const chapterWiseStudyQuestions = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Cache Key
  const cacheKey = `lmp:studyq:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE FIRST
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash returns parsed object
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(
            new ApiResponse(200, redisCached, "Important Questions Ready (Cached)")
          );
      }

      // Fallback if string
      if (typeof redisCached === "string") {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              JSON.parse(redisCached),
              "Important Questions Ready (Cached)"
            )
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // 2️⃣ PROMPT — EXACT, NOT MODIFIED
  const prompt = `
You are an API that returns ONLY valid JSON. No extra text, no markdown, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 10 high-probability CBSE Board exam questions for this chapter.

STRICT LANGUAGE RULE:
If the subject is Hindi → give questions ONLY in Hindi.
If the subject is Sanskrit -> give questions ONLY in Sanskrit
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

RULES:
- Focus on NCERT back exercise questions and previous year CBSE questions (PYQs)
- Include questions that are repeatedly asked in CBSE board exams
- Mix of short answer (2-3 marks) and long answer (5 marks) questions
- Questions should cover important concepts, derivations, numericals, and theory
- Each question must be complete and exam-ready

OUTPUT FORMAT (strict JSON only):
{
  "questions": [
    {
      "question": "Complete question statement here"
    },
    {
      "question": "Second complete question"
    }
  ]
}

CRITICAL:
- Return ONLY the JSON object
- NO markdown code blocks
- NO backticks
- NO extra text before or after JSON
- All questions must be CBSE exam pattern based
- Questions should be from NCERT exercises or similar to PYQs
`;

  try {
    // 3️⃣ CHECK DATABASE CACHE
    const importantQuestion = await ChapterWiseImportantQuestionModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (importantQuestion) {
      const safeDBContent = JSON.parse(JSON.stringify(importantQuestion.content));

      // Store in Redis for 2 days
      await redis.set(cacheKey, JSON.stringify(safeDBContent), {
        ex: 60 * 60 * 24 * 2,
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          safeDBContent,
          "Important Questions Ready (DB Cache)"
        )
      );
    }

    // 4️⃣ CALL OPENAI
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    // validation
    parsed.questions.forEach((q, idx) => {
      if (!q.question) {
        throw new Error(`Invalid question structure at index ${idx}`);
      }
    });

    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 5️⃣ SAVE TO DB
    await ChapterWiseImportantQuestionModel.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 6️⃣ SAVE TO REDIS
    await redis.set(cacheKey, JSON.stringify(safeParsed), {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "Important Questions Ready"));
  } catch (error) {
    console.error("Study questions generation failed:", error);
    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to generate important questions. Please try again."
      )
    );
  }
});




const chapterWiseDoubtSolver = asyncHandler(async (req, res) => {
  const { className, subject, chapter, user_doubt} = req.body;
  const { mainSubject, bookName } = parseSubject(subject);

  const prompt = `
  You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking.

Your ONLY task is to solve the student's doubt in a full-mark, topper-style answer — clean, neat, direct and exactly the way toppers write in their exam notebooks.

STRICT LANGUAGE RULE:
If the subject is Hindi → deeply read the doubt and answer ONLY in Hindi.
If the subject is Sanskrit → deeply read the doubt and answer ONLY in Sanskrit and strictly in 3 lines only (can be 2 or 3 lines but NEVER more than 3).
Otherwise → answer ONLY in English. Do NOT use Hindi for English subjects or vice-versa.
If this rule is violated, regenerate the answer.

ANSWER WRITING RULES:
- Start directly with the main concept asked — no introduction, no background story.
- Keep language simple, crisp and exam-oriented — not bookish.
- Include formulas, steps, diagrams, bullet points ONLY when they increase marks — do NOT force them.
- Bold only the MOST important keywords (2–4 only), not entire lines.
- Maintain natural notebook flow, not textbook style.
- No unnecessary theory.

Special case — Derivations / Numericals:
- Do NOT add definitions or theory.
- No introduction or conclusion.
- Only required steps and expressions that lead to the final result.
- Every formula inside $$ ... $$ must contain ONLY mathematical symbols — NO units or words inside.
- Units / explanation MUST be written outside the $$ formula $$ block on the next line.
- If using \\frac, \\sqrt, superscripts, subscripts, Greek letters → always use proper LaTeX syntax (\\alpha, \\theta, \\Delta etc.)

Output safety:
- LaTeX formulas must be wrapped ONLY in $...$ or $$...$$.
- No markdown headings (#), no backticks, no code blocks, no JSON.
- No phrases like "Final Answer:", "Explanation:", "Solution:", "According to the question", etc.
- NEVER write formulas inside normal brackets like ( V ), (Phi), (N). Mathematical symbols MUST appear only inside $$...$$.

Goal:
A topper-style doubt solving answer that is short, neat, direct and guaranteed full marks without unnecessary information.

ADDITIONAL VALIDATIONS:
✔ If the doubt has multiple parts — answer ALL parts one-by-one.
✔ Every heading must be followed by proper explanation — no empty headings.
✔ If the doubt includes “Explain / Define / List / Write properties” — provide clear points.
✔ Minimum 4 points whenever properties/advantages/characteristics are asked.
✔ Stop ONLY after the doubt is fully solved.

BEFORE sending the final answer:
🟢 Double-check the doubt is 100% solved.
🟢 Double-check language rule.
🟢 Double-check all formula safety rules.

OUTPUT: Only the topper-style answer. Nothing else.

Now solve the student's doubt:
Doubt: ${user_doubt}
Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
BookName: ${bookName}
`

  try {
    let output = await askOpenAI(prompt);
  

    return res
      .status(200)
      .json(new ApiResponse(200, output, "Doubt Answer Ready"));
  } catch (error) {
    console.error("Doubt generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to solve doubt. Please try again."
        )
      );
  }
});






export {smartChapterSummary, chapterWiseStudyQuestions, chapterWiseShortNotes, chapterWiseMindMap, chapterWiseDoubtSolver}