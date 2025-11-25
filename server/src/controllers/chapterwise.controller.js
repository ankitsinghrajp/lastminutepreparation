// Feature - 	Description
// Smart Chapter Summary -	AI generates crystal-clear, exam-oriented summaries — no extra info, only what helps in marks.
// 6 Most Important Questions - Auto-detects the highest-probability questions for the board exam from that chapter.
// Short Notes (Toppers Style) - Bullet-point notes written exactly like toppers write in exams.
// Mind Map / Flowchart -	Visual diagrams for each chapter — helps in revision in 2 minutes.
// Formula Sheet / Key Terms -	All formulas, definitions, theorems, dates, character sketches in one place.
// Doubt Solver - Ask ANY doubt from that chapter → AI answers with step-by-step explanation.

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

  jsonString = jsonString.replace(/\\/g, "\\\\");

  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};

const smartChapterSummary = asyncHandler(async (req, res)=>{
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);
   
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
✔ If there is ONE poem/chapter → write its summary in 2–3 paragraphs (each paragraph 10–12 simple lines).
✔ If there are TWO poems/chapters (detected using "/"):
     → First poem/chapter only → 2–3 paragraphs (10–12 simple lines each)
     → Leave ONE real blank line (ENTER twice)
     → Second poem/chapter only → 2–3 paragraphs (10–12 simple lines each)

HARD RULES (non-negotiable):
✔ NO combining or comparing both poems/chapters
✔ Do NOT mention that there are two poems/chapters
✔ Do NOT include titles, headings, names, or section labels such as "First poem", "Second poem", etc.
✔ Just write the first summary → blank line → second summary
✔ REAL blank lines only + NO \\n or \\n\\n text
✔ No bullet points, no numbering, no bold/italics, no emojis, no formulas, no quotes, no author names
✔ Only clean plain text in paragraphs

Return output ONLY in this JSON format:
{
  "summary": "Final summaries with real blank lines"
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

Write a short NCERT-style chapter summary in **10–12 simple lines** only.
It must be crisp, student-friendly, and useful for last-minute revision.

❌ Do NOT include formulas, numericals, derivations, diagrams, definitions, tables, or headings.
❌ Do NOT use bullet points, lists, or line breaks after every sentence.
✔ The summary must be a **single flowing paragraph of 10–12 lines** only.

Return output in JSON format ONLY:
{
  "summary": "10–12 line paragraph here"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`;
  }

  let output = await askOpenAI(prompt);
  
  const parsed = extractJSON(output);
  
return res.status(200).json(new ApiResponse(200, parsed, "Summary Ready"));
});

const chapterWiseShortNotes = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);

  const prompt = `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking.

Your ONLY task is to generate SHORT NOTES for revision, exactly the way toppers write during exam preparation — sharp, concise and scoring.

INPUT will contain only: Class, Subject, Chapter, BookName (optional)
You must generate short notes of that chapter WITHOUT asking for any question.

STRICT LANGUAGE RULE:
If the subject is Hindi → then deeply understand the chapter first and generate short notes ONLY in Hindi.
If the subject is Sanskrit → then deeply understand the chapter first and generate short notes ONLY in Sanskrit and strictly in 2–3 lines only.
Otherwise → generate short notes ONLY in English.
If this rule is violated, regenerate the short notes.

SHORT NOTES RULES (MOST IMPORTANT):
- Output MUST be only in bullet points (• or – allowed)
- No paragraphs at all — short notes only.
- Every line must give an exam-oriented scoring point for revision.
- Notes must fully cover the entire chapter — no missing concepts.
- Keep each bullet short, crisp, and memory-friendly.
- Use **bold** only to highlight 2–4 very important keywords.
- Do NOT add conclusion or summary.

General Rules:
- Do NOT write introductions or explanations.
- No extra theory — only marks-oriented points.
- Maintain natural flow like toppers’ handwritten revision notes.
- No storytelling, no heavy textbook vocabulary.

Formula Rules (if applicable for that chapter):
- Every mathematical symbol MUST be written ONLY inside LaTeX $$ ... $$ format.
- No words or units inside the $$ formula $$.
- Each formula MUST be in its own $$ block (no multiple formulas in one block).
- Do NOT write formulas inside normal brackets like (V), (Phi), (E).

NOT ALLOWED:
- No markdown headings (#), no backticks, no code block, no JSON, no table.
- No phrases like “Final Notes”, “Revision Notes”, “Explanation”, etc.

STRICT FORMAT RULE ⚠️:
You MUST return ONLY valid JSON. No extra text, no markdown, no explanation.

JSON format:
{
  "shortNotes": [
    "• point 1",
    "• point 2",
    "• point 3"
  ]
}

Do not add any other fields. Do not prepend or append text.

BEFORE SENDING FINAL OUTPUT — VALIDATION CHECK:
🟢 Notes MUST be bullets only.
🟢 Language must strictly follow the language rule (Hindi / Sanskrit / English).
🟢 Entire chapter MUST be covered — no main topic should be missing.
🟢 No paragraphs — only bullets.

OUTPUT: Only the short notes. Nothing else.

Now generate short notes for revision:
Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

   
    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Short Notes Ready"));
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

const chapterWiseMindMap = asyncHandler(async (req, res)=>{
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);

      const prompt = `You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking.

Your ONLY task is to generate a **Mind Map / Flowchart** of the entire chapter for revision.  
The output MUST be in valid JSON format so that it can be parsed by code.

STRICT FORMAT RULE ⚠️:
Return ONLY valid JSON. No text outside JSON. No markdown. No backticks.

JSON format:
{
  "diagramType": "mindmap" or "flowchart",
  "mermaid": "MERMAID_CODE_HERE"
}

Where:
- Mind Map format → mindmap
- Flowchart format → flowchart TD or flowchart LR (whichever fits best)

Choose the diagram type automatically based on chapter structure:
- If the chapter contains hierarchical topics → use mindmap
- If the chapter contains step-by-step process / sequence → use flowchart

DIAGRAM RULES:
- MUST use Mermaid syntax only.
- FULL chapter coverage — all main topics & subtopics included.
- NO extra lorem text — only meaningful chapter keywords.
- Node labels must be short, easy to revise, and exam-oriented.
- If any formula exists, include them only in simple LaTeX inside nodes (no $$ blocks).

STRICT OUTPUT RULES:
❌ Do NOT add explanations, heading, description, or summary.
❌ Do NOT add backticks or markdown.
❌ Do NOT add code comments.
❌ Do NOT add JSON fields other than diagramType and mermaid.

OUTPUT: Only valid JSON. Nothing else.

Now generate the JSON mind map / flowchart for:
Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
`
  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

   
    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Mind Map Ready"));
  } catch (error) {
    console.error("Mind Map Generation Failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to generate Mind Map. Please try again."
        )
      );
  }

})

const chapterWiseStudyQuestions = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

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
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    parsed.questions.forEach((q, idx) => {
      if (!q.question) {
        throw new Error(`Invalid question structure at index ${idx}`);
      }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Predicted Questions Ready"));
  } catch (error) {
    console.error("Predicted questions generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to generate predicted questions. Please try again."
        )
      );
  }
});

const chapterWiseFormulaKeyPointsSheet = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking.

Your ONLY task is to generate a Formula Sheet / Key Terms Sheet of the chapter.

STRICT FORMAT RULE:
Return ONLY valid JSON. No text before JSON, no text after JSON, no explanations.

JSON structure to return:
{
  "formulas": [],
  "keyTerms": [],
  "theoremsOrLaws": [],
  "importantDates": [],
  "characterSketches": []
}

RULES:
- Populate only the fields that apply to the given chapter, empty array for others.
- Every formula must be written only inside LaTeX $$ ... $$, one formula per $$ block.
- Key terms must be short and exam-oriented.
- Theorems and laws must be one-line statements.
- Historical dates must be "date - event".
- Character sketches must be "name - short description".

LANGUAGE RULE:
If subject is Hindi → JSON values must be in Hindi.
If subject is Sanskrit → JSON values must be in Sanskrit and strictly 2–3 lines per item.
Otherwise → JSON values must be in English only.

BEFORE RESPONDING:
Check that output is valid JSON.

Now generate the JSON:
Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}

`

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);


    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Key Sheet Ready"));
  } catch (error) {
    console.error("Key Sheet generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to generate Key Sheet. Please try again."
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






export {smartChapterSummary, chapterWiseStudyQuestions, chapterWiseShortNotes, chapterWiseMindMap, chapterWiseFormulaKeyPointsSheet, chapterWiseDoubtSolver}