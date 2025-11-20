import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectCategory, parseSubject } from "../utils/helper.js";
import { askOpenAI } from "../utils/OpenAI.js";

const LastMinutePanelSummary = asyncHandler(async (req, res) => {
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);

    const prompt = `
Give a 3-line NCERT-based summary for Class ${className}, 
Subject: ${mainSubject}, Book: ${bookName}, Chapter: ${chapter}.

Strictly follow this:
1) What this chapter teaches  
2) 3 most important concepts  
3) From where questions usually come  

Return JSON: { "summary": "..." }
`;

    const output = await askOpenAI(prompt);

    return res.status(200).json(new ApiResponse(200, JSON.parse(output), "Summary Ready"));
});

const LastMinutePanelImportantTopics = asyncHandler(async (req, res) => {
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);

 const prompt = `
You must return ONLY valid JSON.
No Markdown. No backticks. No comments. No explanation.

Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
BookName: ${bookName} // This is the name of ncert book class ${className}

Return EXACT JSON in this format:
{
  "topics": [
    {
      "topic": "TOPIC_NAME",
      "explanation": "30–40 word explanation",
      "formula": "If formula exists, format it using HTML math tags (<sup>, <sub>) and fraction structure. Wrap the entire formula inside <p class='text-lg font-semibold text-blue-700 my-2'> ... </p>. If no formula, return ''."
    }
  ]
}

Formula Formatting Rules:
1. Use <sup> for powers (example: c<sup>2</sup>).
2. Use <sub> for indices (example: H<sub>2</sub>O).
3. Format fractions like this:
   <span class='inline-block'>
     <span class='block border-b border-gray-700 text-center'>NUMERATOR</span>
     <span class='block text-center'>DENOMINATOR</span>
   </span>
4. Combine HTML tags to create clean, readable mathematical expressions.
5. The final answer MUST be valid JSON ONLY. No text outside the JSON.
`;



    const output = await askOpenAI(prompt);

    return res.status(200).json(new ApiResponse(200, JSON.parse(output), "Important Topics Ready"));
});

const LastMinutePanelQuickShots = asyncHandler(async (req, res) => {
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const prompt = `
Generate 10 QUICK revision shots for ${className} ${chapter} (${mainSubject}).
NCERT Book: ${bookName}
Stream: ${category}

Make each shot a micro-bite for fast revision:
- 5-word definition
- OPTIONAL Formula / Rule (only if chapter actually has one)
- Diagram / Figure name
- Law + simple application
- One memory trick

⚠️ **Formula Formatting Rules**
If a formula exists:
- Format using HTML math tags:
  - <sub> for subscript → H<sub>2</sub>O
  - <sup> for superscript → E = mc<sup>2</sup>
- For fractions use:
  <div class="fraction"><span class="num">a</span><span class="den">b</span></div>
- Wrap the complete formula inside:
  <p class="text-lg font-semibold text-blue-700 my-2"> ... </p>

If NO formula exists for that point:
- Return an empty string "" for the formula field.

Return JSON strictly in this format:
{
  "shots": [
    {
      "definition": "",
      "formula": "",
      "diagram": "",
      "law": "",
      "memory_trick": ""
    }
  ]
}
NO additional text. ONLY JSON.
`;

    const output = await askOpenAI(prompt);
    return res.status(200).json(new ApiResponse(200, JSON.parse(output), "Quick Shots Ready"));
});

const LastMinutePanelPredictedQuestions = asyncHandler(async (req, res) => {
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const prompt = `
You are an API. Output ONLY valid JSON. No markdown, no backticks, no commentary, no explanation.

Generate 5 CBSE-board **high-probability exam questions** for:
Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
NCERT Book: ${bookName}
Stream: ${category}

FOLLOW CBSE RULES:
- Use NCERT + CBSE PYQs + CBSE Sample Papers ONLY
- Pick MOST REPEATED & MOST IMPORTANT questions
- Highest chance to appear in upcoming CBSE exam
- Strict board-exam style: crisp, factual, examiner-friendly

ANSWER FORMAT RULES:
- Each answer must be 3–6 lines, to-the-point
- Use scoring keywords used by CBSE examiners
- Definitions, logic, reasoning, examples allowed
- OPTIONAL Formula (include ONLY if chapter actually has one)

⚠️ FORMULA FORMATTING RULES (If formula exists):
- Use <sub> for subscript → H<sub>2</sub>O
- Use <sup> for superscript → E = mc<sup>2</sup>
- Fractions must use:
  <div class="fraction"><span class="num">a</span><span class="den">b</span></div>
- Wrap whole formula inside:
  <p class="text-lg font-semibold text-blue-700 my-2"> ... </p>
- If no formula exists → return "" in formula field.

STRICT OUTPUT FORMAT (NO EXTRA TEXT):
{
  "questions": [
    {
      "question": "",
      "answer": "",
      "formula": "",
      "keywords": [""]
    }
  ]
}
Output ONLY pure JSON. Nothing else.
`;

    const output = await askOpenAI(prompt);

    return res.status(200).json(new ApiResponse(200, JSON.parse(output), "Predicted Questions Ready"));
});

const LastMinutePanelMCQs = asyncHandler(async (req, res) => {
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const prompt = `
You are an API. Output ONLY valid JSON. No markdown, no backticks, no explanations.

Generate EXACTLY 5 CBSE-board style **high-probability MCQs** for:
Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
Book: ${bookName}
Stream: ${category}

MCQ RULES:
- Follow NCERT + CBSE PYQs + CBSE Sample Papers
- Only pick MOST IMPORTANT & MOST REPEATED MCQs
- 4 options per MCQ (A/B/C/D)
- 1 correct option
- Very short, exam-style explanation (2–3 lines)
- If a formula is needed, apply OPTIONAL formula formatting rules below

⚠️ FORMULA FORMATTING RULES (ONLY IF formula appears):
- Use <sub> for subscript → H<sub>2</sub>O
- Use <sup> for superscript → E = mc<sup>2</sup>
- For fractions use:
  <div class="fraction"><span class="num">a</span><span class="den">b</span></div>
- Wrap whole formula inside:
  <p class="text-lg font-semibold text-blue-700 my-2"> ... </p>
- If formula not required → return "".

STRICT JSON OUTPUT FORMAT:
{
  "mcqs": [
    {
      "question": "",
      "options": ["A) ", "B) ", "C) ", "D) "],
      "correct": "",
      "formula": "",
      "explanation": ""
    }
  ]
}

Output ONLY the JSON. No text before or after.
`;

    const output = await askOpenAI(prompt);
    return res.status(200).json(new ApiResponse(200, JSON.parse(output), "MCQs Ready"));
});

const LastMinutePanelMemoryBooster = asyncHandler(async (req, res) => {
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const prompt = `
You are an API. Output ONLY valid JSON. Do NOT use markdown, do NOT use backticks.

Generate EXACTLY 3 **CBSE-based high-impact memory boosters** for:
Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
NCERT Book: ${bookName}
Stream: ${category}

CONTENT RULES:
- Use ONLY NCERT + CBSE PYQs + CBSE Sample Papers
- Boosters must be meaningful, highly effective, exam-focused
- Each booster should be one of:
  • Acronym  
  • Story / Mini tale  
  • Pattern / Logic  
  • Visual Association  
- Be short, powerful, and easy to remember
- If a formula is needed, apply the formula rules below

⚠️ FORMULA FORMATTING RULES (ONLY IF formula appears):
- Use <sub> for subscript → H<sub>2</sub>O
- Use <sup> for superscript → E = mc<sup>2</sup>
- Use fraction HTML:
  <div class="fraction"><span class="num">a</span><span class="den">b</span></div>
- Wrap full formula in:
  <p class="text-lg font-semibold text-blue-700 my-2"> ... </p>
- If no formula required, return "" in formula field

STRICT JSON OUTPUT:
{
  "boosters": [
    {
      "text": "",
      "formula": ""
    }
  ]
}

Output ONLY the JSON object. No explanation. No surrounding text.
`;

    const output = await askOpenAI(prompt);

    return res.status(200).json(new ApiResponse(200, JSON.parse(output), "Memory Booster Ready"));
});

const LastMinutePanelAICoach = asyncHandler(async (req, res) => {
    const { className, subject, chapter } = req.body;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const prompt = `
You are an API. Output ONLY valid JSON. NO markdown, NO backticks, NO text outside JSON.

TASK:
Act as a CBSE-focused AI revision coach for:
Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
NCERT Book: ${bookName}
Stream: ${category}

REVISION RULES:
- Follow ONLY NCERT, CBSE PYQs, CBSE Sample Papers.
- Advice must be practical, exam-focused and short.
- Include what to read first, next and last.
- Include break strategy & revision cycle.
- Keep steps short and clear.

FORMULA RULES (ONLY IF formula is needed in the step):
- Use HTML formatting:
  - <sub> for subscript → H<sub>2</sub>O
  - <sup> for superscript → E = mc<sup>2</sup>
  - Fractions:
    <div class="fraction"><span class="num">a</span><span class="den">b</span></div>
- Wrap the entire formula inside:
  <p class="text-lg font-semibold text-blue-700 my-2"> ... </p>
- If no formula required → return "" in formula field.

STRICT JSON OUTPUT (MANDATORY):
{
  "coach": [
    {
      "step": "",
      "formula": ""
    }
  ]
}

RULES:
- Do NOT include any extra text before or after this JSON.
- Do NOT include comments, explanations, or markdown.
- Use only plain JSON.
- Ensure JSON is 100% valid and parsable.

`;

    const output = await askOpenAI(prompt);

    return res.status(200).json(new ApiResponse(200, JSON.parse(output), "AI Coach Ready"));
});


export {
    LastMinutePanelSummary, 
    LastMinutePanelImportantTopics,
    LastMinutePanelQuickShots,
    LastMinutePanelPredictedQuestions,
    LastMinutePanelMCQs,
    LastMinutePanelMemoryBooster,
    LastMinutePanelAICoach
}