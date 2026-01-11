import { inngest } from "../../libs/inngest.js";
import { Booster } from "../../models/LastMinuteBeforeExam/memoryBooster.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

/* -------------------- JSON EXTRACTOR -------------------- */
const extractMemoryBoosterJSON = (text) => {
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

    if (!parsed.boosters || !Array.isArray(parsed.boosters)) {
      throw new Error("Invalid structure: 'boosters' array not found");
    }

    if (parsed.boosters.length !== 3) {
      throw new Error(`Expected exactly 3 boosters, got ${parsed.boosters.length}`);
    }

    const validTypes = ["acronym", "story", "pattern"];
    parsed.boosters.forEach((booster, idx) => {
      if (!booster.type || !validTypes.includes(booster.type)) {
        throw new Error(`Invalid type at index ${idx}`);
      }
      if (!booster.content || typeof booster.content !== "string") {
        throw new Error(`Invalid content at index ${idx}`);
      }
    });

    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
};

/* -------------------- PRIMARY INNGEST FUNCTION -------------------- */
export const lastNightMemoryBoosterFn = inngest.createFunction(
  {
    id: "lmp-memory-booster",
    name: "Generate LMP Memory Booster",
    retries: 0,
  },
  { event: "lmp/generate.memoryBooster" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:booster:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:booster:pending:${className}:${mainSubject}:${chapter}`;
    const fixedCacheKey = `lmp:booster:fixed:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await Booster.findOne({
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
        return { boosters: safeData.boosters, source: "database" };
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
Generate EXACTLY 3 MEMORY BOOSTERS strictly from THIS chapter only.

Types (EXACT):
1) acronym
2) story
3) pattern

Boosters must help students recall exam-relevant concepts quickly.

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT LOCKED)
────────────────────────────────────────

Language MUST strictly follow the subject.
NO cross-language mixing is allowed.

1) If Subject is "Hindi":
   - ALL content (content field only) MUST be ONLY in PURE, FORMAL HINDI.
   - Use CBSE / NCERT academic Hindi.
   - NO English words.
   - NO Sanskrit words.
   - NO Hinglish or transliteration.

2) If Subject is "Sanskrit":
   - ALL content MUST be ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, verb forms, and case endings (विभक्ति).
   - NO Hindi words.
   - NO Hindi sentence structure.
   - NO English words.
   - NO transliteration.

   Forbidden in Sanskrit:
   • Hindi auxiliaries (है, हैं, किया, करेगा, आदि)
   • Hindi connectors (और, लेकिन, क्योंकि, आदि)
   • Modern conversational tone

   Required Sanskrit characteristics:
   • Proper Sanskrit vocabulary and grammar
   • Correct verb forms and विभक्ति usage
   • Classical Sanskrit sentence structure

   If ANY Hindi or English word or grammar appears → IMMEDIATELY regenerate.

3) For ALL OTHER subjects (Maths, Science, Physics, Chemistry, Biology, SST, etc.):
   - ALL content MUST be ONLY in STANDARD ACADEMIC ENGLISH.
   - NO Hindi.
   - NO Sanskrit.
   - NO Hinglish or translated phrasing.

AUTO-REGENERATION RULE:
- If ANY subject-language rule is violated, discard and regenerate completely.

────────────────────────────────────────
CHAPTER–TOPIC ISOLATION (STRICT)
────────────────────────────────────────

- Boosters MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce concepts, formulas, reactions, or patterns
  from other chapters or classes.
- Avoid unnecessary narrative unless NCERT explicitly uses it.

────────────────────────────────────────
BOOSTER QUALITY RULES
────────────────────────────────────────

- EXACTLY 3 boosters.
- EXACTLY one booster of each type: acronym, story, pattern.
- Content must test or reinforce CORE concepts.
- Avoid vague, generic, motivational, or non-syllabus content.

────────────────────────────────────────
UNIVERSAL FORMULA & MATH RULES (MANDATORY)
────────────────────────────────────────

1) ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression (equations, formulas, fractions, powers,
  subscripts, trigonometric functions, inequalities, derivatives, integrals,
  chemical equations, units) MUST be written using LaTeX.
- Inline math → $ ... $
- Display math → $$ ... $$
- NEVER output mathematical tokens or operators as plain text.

────────────────────────────────────────
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
────────────────────────────────────────

FOR ALL CHEMICAL CONTENT IN BOOSTERS:

1) SIMPLE CHEMICAL FORMULAS (in content text):
   - Use INLINE math mode with subscripts/superscripts
   - LaTeX backslashes MUST be DOUBLED in JSON strings: \\\\
   - Examples in content field:
     • Water: $H_2O$
     • Sulfuric acid: $H_2SO_4$
     • Potassium dichromate: $K_2Cr_2O_7$
     • Permanganate ion: $MnO_4^-$
     • Hydronium: $H_3O^+$
     • Chromate: $CrO_4^{2-}$

2) CHEMICAL EQUATIONS IN CONTENT:
   - Use DISPLAY math mode for reactions: $$ ... $$
   - LaTeX backslashes MUST be DOUBLED: \\\\
   - Examples in content field:
     • Simple reaction:
       $$K_2Cr_2O_7 + H_2SO_4 \\\\to \\\\text{products}$$
     • Equilibrium:
       $$N_2 + 3H_2 \\\\rightleftharpoons 2NH_3$$
     • With conditions:
       $$\\\\ce{2KMnO_4 \\\\xrightarrow{\\\\Delta} K_2MnO_4 + MnO_2 + O_2}$$

────────────────────────────────────────
LATEX DELIMITER RESTRICTION (MANDATORY)
────────────────────────────────────────

- NEVER use escaped LaTeX delimiters \\( ... \\) or \\[ ... \\].
- Inline mathematics MUST be written ONLY using: $ ... $
- Display mathematics MUST be written ONLY using: $$ ... $$
- Any occurrence of \\(, \\), \\[, or \\] is STRICTLY FORBIDDEN.
- If such delimiters appear, regenerate the output.

────────────────────────────────────────
NEWLINES IN JSON STRINGS
────────────────────────────────────────

- For line breaks in the content field, use the escaped newline sequence: \\n
- Example: "Line 1\\nLine 2\\nLine 3"
- Do NOT use literal line breaks inside JSON string values
- This ensures the JSON remains valid and parseable

────────────────────────────────────────
JSON SYNTAX RULES (CRITICAL)
────────────────────────────────────────

MANDATORY JSON FORMAT RULES:

1. **String Values MUST use DOUBLE QUOTES only**
   ✓ CORRECT: "type": "acronym"
   ✗ WRONG: "type": 'acronym'

2. **Property Names MUST use DOUBLE QUOTES**
   ✓ CORRECT: "content": "..."
   ✗ WRONG: 'content': "..."

3. **No trailing commas**
   ✗ WRONG: {"type": "acronym",}
   ✓ CORRECT: {"type": "acronym"}

4. **LaTeX backslashes in JSON strings**
   ✓ CORRECT: "$\\\\frac{a}{b}$"
   ✗ WRONG: "$\\frac{a}{b}$"

────────────────────────────────────────
OUTPUT JSON (STRICT)
────────────────────────────────────────

{
  "boosters": [
    { "type": "acronym", "content": "..." },
    { "type": "story", "content": "..." },
    { "type": "pattern", "content": "..." }
  ]
}

CRITICAL:
- EXACTLY 3 boosters
- Return ONLY valid JSON
- ALL string values use DOUBLE QUOTES
- ALL LaTeX backslashes DOUBLED in JSON strings
- Newlines use \\n
`;

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
      let primaryBoosters;
      try {
        const extracted = extractMemoryBoosterJSON(primaryRaw);
        primaryBoosters = JSON.parse(JSON.stringify(extracted));

        // 🚀 IMMEDIATELY CACHE PRIMARY RESPONSE
        await redis.set(cacheKey, JSON.stringify(primaryBoosters), {
          ex: 60 * 60 * 24 * 30, // 2 days
        });

    await Booster.findOneAndUpdate(
    { className, subject:mainSubject, chapter },
    {
      $set: {
        content: primaryBoosters,
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
        const fixerEvent = await step.sendEvent("trigger-booster-fixer", {
          name: "lmp/fix.memoryBooster",
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
        boosters: primaryBoosters.boosters,
        source: "generated",
        status: "primary",
        fixerRunId: fixerRunId,
        cacheKey: cacheKey,
        message: "Primary response cached, fixing in background"
      };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateMemoryBooster error: ${err.message}`);
    } finally {
      await redis.del(pendingKey);
    }
  }
);

/* -------------------- BACKGROUND FIXER FUNCTION -------------------- */
export const memoryBoosterFixerFn = inngest.createFunction(
  {
    name: "Fix Memory Booster LaTeX",
    id: "memory-booster-fixer",
    retries: 1,
  },
  { event: "lmp/fix.memoryBooster" },
  async ({ event, step }) => {
    const { className, subject, chapter, primaryRaw, cacheKey, fixedCacheKey } = event.data;

    try {
      const fixerPrompt = `
You are a STRICT JSON + LaTeX ESCAPING FIXER for MEMORY BOOSTERS.

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

ALL math MUST remain INLINE using $ ... $ ONLY.

==============================
FIELD-SPECIFIC RULES
==============================

1. "type" FIELD:
- Must be exactly: "acronym", "story", or "pattern"
- NO changes allowed
- Must use double quotes

2. "content" FIELD:
- Inline math allowed using $...$ ONLY
- ALL LaTeX commands MUST have DOUBLED backslashes (\\\\)
- Math MUST remain inline

Wrong:
"content": "Formula: $\\frac{a}{b}$"

Correct:
"content": "Formula: $\\\\frac{a}{b}$"

❌ Do NOT introduce $$  
❌ Do NOT rewrite content  
❌ Do NOT change language

3. JSON SYNTAX:
- Use DOUBLE quotes only for all strings and properties
- Escape newlines as \\n
- No trailing commas
- Preserve structure exactly

==============================
STRICTLY FORBIDDEN
==============================

- ❌ Introducing $$ anywhere
- ❌ Introducing \\[ \\] or \\( \\)
- ❌ Changing type values
- ❌ Rephrasing content
- ❌ Adding or removing boosters
- ❌ Using single quotes (')

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
      let fixedBoosters;
      try {
        const extracted = extractMemoryBoosterJSON(fixedRaw);
        fixedBoosters = JSON.parse(JSON.stringify(extracted));
      } catch (err) {
        // If fixer fails, keep the primary version
        console.error("Fixer failed, keeping primary version:", err.message);
        return { status: "fixer_failed", kept: "primary" };
      }

      // Save fixed version to DB
      await step.run("Save Fixed to DB", async () => {
        await Booster.findOneAndUpdate(
          {
            className,
            subject,
            chapter,
          },
          {
            content: fixedBoosters,
          },
          {
            upsert: true,
          }
        );
      });

      // Update Redis cache with fixed version
      await redis.set(cacheKey, JSON.stringify(fixedBoosters), {
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
      await redis.set(fixedCacheKey, JSON.stringify(fixedBoosters), {
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
