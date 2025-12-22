
import { inngest } from "../../libs/inngest.js";
import { ImpTopicsModel } from "../../models/LastMinuteBeforeExam/impTopics.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

/* -------------------- JSON EXTRACTOR (UNCHANGED) -------------------- */
export const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("No JSON object found in AI response.");
  }

  let jsonString = text.substring(first, last + 1);
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      throw new Error("Invalid structure: 'topics' array not found");
    }

    if (parsed.topics.length !== 6) {
      throw new Error(`Expected exactly 6 topics, got ${parsed.topics.length}`);
    }

    parsed.topics.forEach((topic, idx) => {
      if (!topic.topic || typeof topic.topic !== "string") {
        throw new Error(`Invalid topic at index ${idx}`);
      }
      if (!topic.explanation || typeof topic.explanation !== "string") {
        throw new Error(`Invalid explanation at index ${idx}`);
      }
      if (!topic.hasOwnProperty("formula") || typeof topic.formula !== "string") {
        throw new Error(`Invalid formula at index ${idx}`);
      }
    });

    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
};

/* -------------------- INNGEST FUNCTION -------------------- */
export const lastNightImportantTopicsFn = inngest.createFunction(
  {
    name: "Generate LMP Important Topics",
    id: "last-night-important-topics",
    retries: 0,
  },
  { event: "lmp/generate.importantTopics" },
  async ({ event }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:imptopics:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:imptopics:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await ImpTopicsModel.findOne({
        className,
        subject: mainSubject,
        chapter,
      });

      if (dbCache) {
        await redis.set(cacheKey, JSON.stringify(dbCache.content), {
          EX: 60 * 60 * 24 * 2,
        });
        await redis.del(pendingKey);
        return { topics: dbCache.content.topics, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // ---------------------------------------------------------

      const prompt =`
You are an API that returns ONLY valid JSON.
No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 6 MOST FREQUENT and MOST IMPORTANT
CBSE Board exam IMPORTANT TOPICS strictly from THIS chapter only.

Each topic must:
- Be a syllabus-defined concept from this subject
- Be frequently asked or high-weightage in CBSE exams
- Represent a concept students revise the night before exam

For EACH topic:
- Give the topic name
- Give a short definition (1–2 lines)
- Give ONE standard CBSE formula directly related to that topic (if applicable)

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
────────────────────────────────────────

- Language of topics and explanations is STRICTLY determined by the subject.
- Language MUST match the subject exactly.
- Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL topics and explanations MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - Formula field MUST be empty string "".

2) If Subject is "Sanskrit":
   - ALL topics and explanations MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT include English words or transliteration.
   - Formula field MUST be empty string "".

3) For ALL OTHER subjects (Physics, Chemistry, Maths, Biology, etc.):
   - ALL topics and explanations MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or Hinglish.
   - Formula field MUST contain a relevant formula in LaTeX.

FORBIDDEN (ZERO TOLERANCE):

- Mixing languages in any form.
- Transliteration.
- Subject-language mismatch.
- Bilingual phrasing.

AUTO-REGENERATION RULE (MANDATORY):

- If ANY language rule is violated,
  → IMMEDIATELY discard and regenerate the entire output.

────────────────────────────────────────
CHAPTER–TOPIC ISOLATION (STRICT)
────────────────────────────────────────

- Topics MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce topics, laws, or formulas from other chapters or classes.

────────────────────────────────────────
TOPIC CONTENT RULES
────────────────────────────────────────

- EXACTLY 6 topics.
- Topic name must be short and precise (e.g., "Electric Flux").
- Explanation must be a definition or meaning (1–2 lines only).
- NO questions.
- NO derivations.
- NO examples.
- NO extra theory.

────────────────────────────────────────
UNIVERSAL FORMULA & MATH RULES (MANDATORY)
────────────────────────────────────────

1) LATEX IN EXPLANATION FIELD:
- If the explanation contains any mathematical symbols, variables, or expressions,
  they MUST be wrapped in LaTeX delimiters.
- Inline math → $ ... $
- Display math → $$ ... $$
- Keep mathematical content in explanations minimal.

────────────────────────────────────────
LATEX DELIMITER RESTRICTION
────────────────────────────────────────

- NEVER use \\( ... \\) or \\[ ... \\].
- Use ONLY $...$ or $$...$$ in the explanation field.

────────────────────────────────────────
FORMULA SEPARATION RULE (STRICT)
────────────────────────────────────────

- Keep formulas separate from definitions.
- The "explanation" field should focus on the concept definition.
- The "formula" field should contain the key formula.
- Avoid writing full formulas in the explanation field.
- Simple variables or symbols in explanation are allowed if wrapped in $...$.



────────────────────────────────────────
FORMULA FIELD RULE (VERY IMPORTANT)
────────────────────────────────────────

- Formula field MUST contain:
  ✔ ONE standard CBSE formula related to THAT topic
  ✔ PURE LaTeX expression only (raw LaTeX code)
  ✔ NO delimiters (no $ or $$)
- DO NOT include:
  ✖ text
  ✖ explanations
  ✖ multiple formulas
  ✖ delimiters like $ or $$

The formula field stores RAW LaTeX code for indexing/rendering purposes.

Example (CORRECT for Electric Flux):
\\Phi_E = \\vec{E} \\cdot \\vec{A}

Example (WRONG):
Electric flux is given by Φ = E·A

Example (WRONG - has delimiters):
$\\Phi_E = \\vec{E} \\cdot \\vec{A}$

FORMULA HARD CONSTRAINT (ABSOLUTE):

- Formula MUST contain EXACTLY ONE mathematical or chemical expression.
- NEVER include definitions, labels, headings, or words inside formula.
- NEVER use \\text{}, \\quad, commas, semicolons, or explanations.
- NEVER combine multiple formulas in one field.
- If a topic has multiple cases, choose ONLY the MOST STANDARD CBSE formula.
- If violated → REGENERATE.


KATEX COMPATIBILITY RULE (ABSOLUTE):

- Formula MUST use ONLY standard, widely supported LaTeX commands.
- Allowed examples: \\lim, \\frac, \\sin, \\cos, \\tan, \\to, \\cdot, \\vec, ^, _, =, +, -
- FORBIDDEN: any invented or uncommon commands such as \\uim, \\ulim, \\ltext, \\eqn, etc.
- If any non-standard command appears → REGENERATE.


────────────────────────────────────────
FINAL SELF-VALIDATION (MANDATORY)
────────────────────────────────────────

Before returning JSON:
- Confirm EXACTLY 6 topics
- Confirm explanation is definition-style
- Confirm formula belongs to the topic
- Confirm formula field has NO $ or $$ delimiters
- Confirm formula field contains raw LaTeX only
- Confirm LaTeX correctness

Return output ONLY after passing ALL checks.

────────────────────────────────────────
OUTPUT JSON (STRICT)
────────────────────────────────────────

{
  "topics": [
    {
      "topic": "Topic name",
      "explanation": "1–2 line definition (use $...$ for any math symbols)",
      "formula": "Pure raw LaTeX formula WITHOUT $ or $$ delimiters"
    }
  ]
}

────────────────────────────────────────
CRITICAL
────────────────────────────────────────

- EXACTLY 6 topics
- Output ONLY valid JSON
- NO extra fields
- NO extra text
- Explanation field: use $...$ for any math symbols
- Formula field: raw LaTeX code without delimiters
- Must render correctly in Markdown + KaTeX
`;906

      // -------------------------------------------------------------------
      // 3️⃣ FIRST AI CALL (PRIMARY)
      // -------------------------------------------------------------------
      const primaryRaw = await askOpenAI(prompt, "gpt-5.1", {
        response_format: { type: "json_object" },
      });

      // -------------------------------------------------------------------
      // 🔁 4️⃣ SECOND AI CALL (FIX ONLY — SAME AS AI COACH)
      // -------------------------------------------------------------------
    const fixerPrompt = `
You are a STRICT JSON + LaTeX ESCAPING FIXER for IMPORTANT TOPICS.

The input JSON is MOSTLY CORRECT.
DO NOT regenerate.
DO NOT rewrite text.
DO NOT change meaning, wording, order, or structure.

==============================
ABSOLUTE NON-NEGOTIABLE RULE
==============================

❌ NEVER use $$ ... $$  
❌ NEVER introduce display math  
❌ NEVER use \\[ ... \\] or \\( ... \\)  

ALL math MUST remain INLINE using $ ... $ ONLY (and only inside "explanation").

==============================
FIELD-SPECIFIC RULES
==============================

1. "topic" FIELD:
- Plain text only
- NO LaTeX
- NO math
- Leave unchanged

--------------------------------------------------

2. "explanation" FIELD:
- Inline math allowed using $...$ ONLY
- ALL LaTeX commands MUST have DOUBLED backslashes (\\\\)
- Math MUST remain inline

Wrong:
"explanation": "Flux is given by $\\Phi = EA$"

Correct:
"explanation": "Flux is given by $\\\\Phi = E \\\\cdot A$"

❌ Do NOT introduce $$  
❌ Do NOT move formulas here  
❌ Do NOT rewrite explanations  

--------------------------------------------------

3. "formula" FIELD (RAW LaTeX ONLY):
- Use SINGLE backslashes (\\)
- NO $ or $$ delimiters
- EXACTLY one formula
- NO text, no labels, no explanation

Wrong:
"formula": "$\\Phi = EA$"
"formula": "$$\\Phi = EA$$"
"formula": "\\\\Phi = EA"

Correct:
"formula": "\\Phi = \\vec{E} \\cdot \\vec{A}"

--------------------------------------------------

4. JSON SYNTAX:
- Use DOUBLE quotes only
- Escape newlines as \\n
- No trailing commas
- Preserve structure exactly

==============================
STRICTLY FORBIDDEN
==============================

- ❌ Introducing $$ anywhere
- ❌ Introducing \\[ \\] or \\( \\)
- ❌ Changing topic names
- ❌ Rephrasing explanations
- ❌ Moving formulas into explanation
- ❌ Adding or removing topics

==============================
INPUT JSON TO FIX
==============================

${primaryRaw}

==============================
OUTPUT
==============================

Return ONLY the corrected JSON.
NO explanation.
NO markdown.
NO extra text.
`.trim();
 
    const subjectHardness = ["physics","chemistry","mathematics","applied mathematics", "accountancy", "bio technology"];

      let secondPassModel;
      if(subjectHardness.includes(mainSubject)){
        secondPassModel = "gpt-4o";
      }
      else{
        secondPassModel = "gpt-4o-mini"
      }


      const finalRaw = await askOpenAI(fixerPrompt, secondPassModel, {
        response_format: { type: "json_object" },
      });

      // -------------------------------------------------------------------
      // 5️⃣ PARSE ONLY ONCE (FINAL OUTPUT)
      // -------------------------------------------------------------------
      const parsed = extractJSON(finalRaw);
      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 6️⃣ SAVE DB
      // -------------------------------------------------------------------
      await ImpTopicsModel.create({
        className,
        subject: mainSubject,
        chapter,
        content: safeParsed,
      });

      // -------------------------------------------------------------------
      // 7️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, JSON.stringify(safeParsed), {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);

      return { topics: safeParsed.topics, source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateImportantTopics error: ${err.message}`);
    }
  }
);
