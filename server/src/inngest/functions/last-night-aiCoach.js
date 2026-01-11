import { inngest } from "../../libs/inngest.js";
import { AiCoach } from "../../models/LastMinuteBeforeExam/aiCoach.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

/* -------------------- JSON EXTRACTOR -------------------- */
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

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error("Invalid structure: 'steps' array not found");
    }

    if (parsed.steps.length !== 6) {
      throw new Error(`Expected exactly 6 steps, got ${parsed.steps.length}`);
    }

    const priorities = parsed.steps.map((s) => s.priority);
    if (new Set(priorities).size !== 6) {
      throw new Error("Duplicate priorities detected");
    }

    parsed.steps.forEach((step, idx) => {
      if (!step.priority || typeof step.priority !== "number") {
        throw new Error(`Invalid priority at index ${idx}`);
      }
      if (!step.action || typeof step.action !== "string") {
        throw new Error(`Invalid action at index ${idx}`);
      }
      if (!step.hasOwnProperty("formula") || typeof step.formula !== "string") {
        throw new Error(`Invalid formula at index ${idx}`);
      }
    });

    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
};

/* -------------------- PRIMARY INNGEST FUNCTION -------------------- */
export const lastNightAICoachFn = inngest.createFunction(
  {
    id: "lmp-ai-coach",
    name: "Generate LMP AI Coach",
    retries: 0,
  },
  { event: "lmp/generate.aiCoach" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:aicoach:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:aicoach:pending:${className}:${mainSubject}:${chapter}`;
    const fixedCacheKey = `lmp:aicoach:fixed:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await AiCoach.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeData = JSON.parse(JSON.stringify(dbCache.content));

        await redis.set(cacheKey, JSON.stringify(safeData), {
          ex: 60 * 60 * 24 * 30,
        });
        await redis.del(pendingKey);
        return { steps: safeData.steps, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT
      // -------------------------------------------------------------------
      const prompt = `
You are an API that returns ONLY valid JSON.
No extra text, no explanation outside JSON.

CRITICAL JSON REQUIREMENT:
This is a JSON API. ALL string values and property names MUST use DOUBLE QUOTES (").
NEVER use single quotes (') in JSON output - it will cause parsing failure.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 6 REVISION STEPS strictly from THIS chapter only.

Each step must:
- Be a high-priority revision action for CBSE board exam
- Be specific to this chapter's concepts
- Help students revise efficiently the night before exam

For EACH step:
- Give priority number (1-6)
- Give action/instruction (what to revise/practice)
- Give ONE standard CBSE formula related to that step (if applicable)

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
────────────────────────────────────────

Language MUST strictly follow the subject.
NO cross-language mixing is allowed.

1) If Subject is "Hindi":
   - ALL steps and actions MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - Formula field MUST be empty string "".

2) If Subject is "Sanskrit":
   - ALL steps and actions MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT include English words or transliteration.
   - Formula field MUST be empty string "".

3) For ALL OTHER subjects (Physics, Chemistry, Maths, Biology, SST, etc.):
   - ALL steps and actions MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or Hinglish.
   - Formula field MUST contain relevant formula in raw LaTeX (if applicable).

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

- Steps MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce topics, laws, or formulas from other chapters or classes.

────────────────────────────────────────
REVISION STEP CONTENT RULES
────────────────────────────────────────

- EXACTLY 6 steps (priority 1 to 6).
- Priority 1 = MOST IMPORTANT, Priority 6 = LEAST IMPORTANT (but still important).
- Action must be clear, specific, and exam-focused.
- NO vague actions like "Study well" or "Read chapter".
- NO questions or derivations in the action field.

────────────────────────────────────────
UNIVERSAL FORMULA & MATH RULES (MANDATORY)
────────────────────────────────────────

1) LATEX IN ACTION FIELD:
- If the action contains any mathematical symbols, variables, or expressions,
  they MUST be wrapped in LaTeX delimiters.
- Inline math → $ ... $
- Display math → $$ ... $$
- LaTeX backslashes MUST be DOUBLED in the action field: \\\\

────────────────────────────────────────
FORMULA FIELD RULE (VERY IMPORTANT)
────────────────────────────────────────

- Formula field MUST contain:
  ✔ ONE standard CBSE formula related to THAT step
  ✔ PURE LaTeX expression only (raw LaTeX code)
  ✔ NO delimiters (no $ or $$)
  ✔ SINGLE backslashes (\\)

────────────────────────────────────────
JSON SYNTAX RULES (CRITICAL)
────────────────────────────────────────

1. String values MUST use DOUBLE QUOTES only
2. Property names MUST use DOUBLE QUOTES
3. No trailing commas
4. Numbers don't need quotes (priority field)
5. Action field: LaTeX backslashes DOUBLED (\\\\)
6. Formula field: LaTeX backslashes SINGLE (\\), NO delimiters
7. Newlines must be escaped as \\n

────────────────────────────────────────
OUTPUT JSON (STRICT)
────────────────────────────────────────

{
  "steps": [
    { "priority": 1, "action": "...", "formula": "" },
    { "priority": 2, "action": "...", "formula": "" },
    { "priority": 3, "action": "...", "formula": "" },
    { "priority": 4, "action": "...", "formula": "" },
    { "priority": 5, "action": "...", "formula": "" },
    { "priority": 6, "action": "...", "formula": "" }
  ]
}

CRITICAL:
- EXACTLY 6 steps with priority 1-6
- Return ONLY valid JSON
- ALL strings use DOUBLE QUOTES
- Action field: LaTeX backslashes DOUBLED (\\\\)
- Formula field: LaTeX backslashes SINGLE (\\), NO delimiters
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ FIRST AI CALL (PRIMARY GENERATION)
      // -------------------------------------------------------------------
      const primaryRaw = await step.run("Call OpenAI (Primary)", async () => {
        return await askOpenAI(prompt, "gpt-5.1", {
          response_format: { type: "json_object" },
        });
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE PRIMARY RESPONSE & CACHE IMMEDIATELY
      // -------------------------------------------------------------------
      let primarySteps;
      try {
        const extracted = extractJSON(primaryRaw);
        primarySteps = JSON.parse(JSON.stringify(extracted));

        // 🚀 IMMEDIATELY CACHE PRIMARY RESPONSE
        await redis.set(cacheKey, JSON.stringify(primarySteps), {
          ex: 60 * 60 * 24 * 30, // 2 days
        });

   await AiCoach.findOneAndUpdate(
    { className, subject:mainSubject, chapter },
    {
      $set: {
        content: primarySteps,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

        // Store status in separate key
        await redis.set(`${cacheKey}:status`, JSON.stringify({
          version: "primary",
          generatedAt: new Date().toISOString(),
          isFixed: false
        }), {
          ex: 60 * 60 * 24 * 30,
        });

        await redis.del(pendingKey);
      } catch (err) {
        throw new Error("Failed to parse primary AI response: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ TRIGGER BACKGROUND FIXER (NON-BLOCKING)
      // -------------------------------------------------------------------
      let fixerRunId = null;
      try {
        const fixerEvent = await step.sendEvent("trigger-coach-fixer", {
          name: "lmp/fix.aiCoach",
          data: {
            className,
            subject: mainSubject,
            chapter,
            primaryRaw,
            cacheKey,
            fixedCacheKey,
          },
        });
        
        // Capture the fixer run ID
        if (fixerEvent && fixerEvent.ids && fixerEvent.ids.length > 0) {
          fixerRunId = fixerEvent.ids[0];
        }
      } catch (err) {
        console.error("Failed to trigger fixer:", err.message);
        // Don't throw - we already have primary response cached
      }

      // -------------------------------------------------------------------
      // 6️⃣ RETURN IMMEDIATELY WITH PRIMARY RESPONSE
      // -------------------------------------------------------------------
      return { 
        steps: primarySteps.steps,
        source: "generated",
        status: "primary",
        fixerRunId: fixerRunId,
        cacheKey: cacheKey,
        message: "Primary response cached, fixing in background"
      };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateAICoach error: ${err.message}`);
    } finally {
      await redis.del(pendingKey);
    }
  }
);

/* -------------------- BACKGROUND FIXER FUNCTION -------------------- */
export const aiCoachFixerFn = inngest.createFunction(
  {
    name: "Fix AI Coach LaTeX",
    id: "ai-coach-fixer",
    retries: 1,
  },
  { event: "lmp/fix.aiCoach" },
  async ({ event, step }) => {
    const { className, subject, chapter, primaryRaw, cacheKey, fixedCacheKey } = event.data;

    try {
      const fixerPrompt = `
You are a STRICT JSON + LaTeX ESCAPING FIXER for AI COACH STEPS.

The input JSON is MOSTLY CORRECT.
DO NOT regenerate.
DO NOT rewrite text.
DO NOT change meaning, wording, order, or structure.

==============================
ABSOLUTE NON-NEGOTIABLE RULE
==============================

❌ NEVER use $$ ... $$ in action field
❌ NEVER introduce display math in action field
❌ NEVER use \\[ ... \\] or \\( ... \\)  

ALL math in action field MUST remain INLINE using $ ... $ ONLY.

==============================
FIELD-SPECIFIC RULES
==============================

1. "priority" FIELD:
- Plain number only
- NO quotes
- Leave unchanged

--------------------------------------------------

2. "action" FIELD:
- Inline math allowed using $...$ ONLY
- ALL LaTeX commands MUST have DOUBLED backslashes (\\\\)
- Math MUST remain inline
- If you see $$...$$ → convert to $...$

Wrong:
"action": "Revise $$\\frac{a}{b}$$ and practice"
"action": "Formula is $\\frac{a}{b}$"

Correct:
"action": "Revise $\\\\frac{a}{b}$ and practice"

❌ Do NOT introduce $$  
❌ Do NOT rewrite actions  
❌ Do NOT change language

--------------------------------------------------

3. "formula" FIELD (RAW LaTeX ONLY):
- Use SINGLE backslashes (\\)
- NO $ or $$ delimiters
- EXACTLY one formula
- NO text, no labels, no explanation

Wrong:
"formula": "$\\frac{a}{b}$"
"formula": "$$\\frac{a}{b}$$"
"formula": "\\\\frac{a}{b}"

Correct:
"formula": "\\frac{a}{b}"

--------------------------------------------------

4. JSON SYNTAX:
- Use DOUBLE quotes only
- Escape newlines as \\n
- No trailing commas
- Preserve structure exactly

==============================
STRICTLY FORBIDDEN
==============================

- ❌ Introducing $$ in action field
- ❌ Introducing \\[ \\] or \\( \\)
- ❌ Changing priority numbers
- ❌ Rephrasing actions
- ❌ Moving formulas into action
- ❌ Adding or removing steps

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

      const subjectHardness = [
        "physics",
        "chemistry",
        "mathematics",
        "applied mathematics",
        "accountancy",
        "bio technology"
      ];

      let secondPassModel;
      if (subjectHardness.includes(subject.toLowerCase())) {
        secondPassModel = "gpt-4o";
      } else {
        secondPassModel = "gpt-4o-mini";
      }

      // Call fixer AI
      const fixedRaw = await step.run("Call OpenAI (Fixer)", async () => {
        return await askOpenAI(fixerPrompt, secondPassModel, {
          response_format: { type: "json_object" },
        });
      });

      // Parse fixed response
      let fixedSteps;
      try {
        const extracted = extractJSON(fixedRaw);
        fixedSteps = JSON.parse(JSON.stringify(extracted));
      } catch (err) {
        // If fixer fails, keep the primary version
        console.error("Fixer failed, keeping primary version:", err.message);
        return { status: "fixer_failed", kept: "primary" };
      }

      // Save fixed version to DB
      await step.run("Save Fixed to DB", async () => {
        await AiCoach.findOneAndUpdate(
          {
            className,
            subject,
            chapter,
          },
          {
            content: fixedSteps,
          },
          {
            upsert: true,
          }
        );
      });

      // Update Redis cache with fixed version
      await redis.set(cacheKey, JSON.stringify(fixedSteps), {
        ex: 60 * 60 * 24 * 30, // 2 days
      });

      // Update status marker
      await redis.set(`${cacheKey}:status`, JSON.stringify({
        version: "fixed",
        fixedAt: new Date().toISOString(),
        isFixed: true
      }), {
        ex: 60 * 60 * 24 * 30,
      });

      // Also store in fixed cache key for reference
      await redis.set(fixedCacheKey, JSON.stringify(fixedSteps), {
        ex: 60 * 60 * 24 * 30,
      });

      return { 
        status: "fixed",
        message: "LaTeX fixed and cached"
      };

    } catch (err) {
      console.error(`Background fixer error: ${err.message}`);
      return { 
        status: "error",
        error: err.message,
        kept: "primary"
      };
    }
  }
);