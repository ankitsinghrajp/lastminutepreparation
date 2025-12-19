import { inngest } from "../../libs/inngest.js";
import {LastMinuteSummaryModel} from "../../models/LastMinuteBeforeExam/summary.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js"; 
import { askOpenAI } from "../../utils/OpenAI.js"; 
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";
import { redis } from "../../libs/redis.js"; 


export const lastNightSummaryFn = inngest.createFunction(

  { name: "Generate LMP Summary",
    id:"last-night-summary",
    retries:0,
   },
  { event: "lmp/generate.summary" },
  async ({ event, step }) => {

    const { className, subject, chapter } = event.data;
      const { mainSubject, bookName } = parseSubject(subject);
      const category = detectCategory(mainSubject);

      const cacheKey = `lmp:summary:${className}:${mainSubject}:${chapter}`;
     const pendingKey = `lmp:summary:pending:${className}:${mainSubject}:${chapter}`;
    try {
  
      // 1️⃣ DB CHECK (Express already did Redis)
      const dbCache = await step.run("DB Check", async () => {
        return await LastMinuteSummaryModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));
        // ensure Redis has it
        await step.run("Save cached to Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBContent), { EX: 60 * 60 * 24 * 2 });
        });
        return { summary: safeDBContent, source: "database" };
      }

   // 2️⃣ BUILD PROMPT
const prompt = await step.run("Build Prompt", async () => {
  if (category === "language") {
    return `
You are a JSON API. Return ONLY valid JSON. No markdown, no code blocks, no explanations.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

────────────────────────────────────────
STRICT LANGUAGE RULE (MANDATORY)
────────────────────────────────────────

1) Hindi subject → Write summary ONLY in Hindi
2) Sanskrit subject → Write summary ONLY in Hindi
3) All other subjects (like maths, science, history, etc.) → Write summary ONLY in English

NO mixing languages. NO transliteration.
If violated → Regenerate completely.

────────────────────────────────────────
DUAL CHAPTER/POEM DETECTION
────────────────────────────────────────

If chapter name contains "/" → TWO separate poems/chapters exist.
Example: "Poem A / Poem B" means TWO different works.

RULE: Summarize them SEPARATELY, never together.

────────────────────────────────────────
SUMMARY STRUCTURE
────────────────────────────────────────

CASE 1: Single poem/chapter
- Write 2-3 paragraphs
- Each paragraph: 3-4 simple sentences
- Plain flowing text (no bullets, no formatting)

CASE 2: Two poems/chapters (detected by "/")
- First poem/chapter: 2-3 paragraphs (3-4 sentences each)
- Insert ONE blank line (use \\n\\n in JSON string)
- Second poem/chapter: 2-3 paragraphs (3-4 sentences each)

────────────────────────────────────────
FORBIDDEN CONTENT (STRICT)
────────────────────────────────────────

DO NOT include:
- Titles, headings, or labels ("First poem", "Second poem", etc.)
- Bullet points or numbered lists
- Bold, italics, or any markdown formatting
- Emojis or special characters
- Formulas or mathematical expressions
- Author names or metadata
- Quotes or citations

────────────────────────────────────────
BLANK LINE RULE (CRITICAL)
────────────────────────────────────────

For dual poems/chapters:
- Use \\n\\n in the JSON string to create blank line
- This is a real newline separator in JSON
- Example: "Summary of first...\\n\\nSummary of second..."

────────────────────────────────────────
JSON FORMAT (ABSOLUTE REQUIREMENT)
────────────────────────────────────────

CRITICAL: Your response must START with { and END with }

NO text before the JSON
NO text after the JSON
NO markdown code blocks like \`\`\`json
Return as single-line minified JSON

────────────────────────────────────────
REQUIRED OUTPUT FORMAT
────────────────────────────────────────

{"summary":"Your complete summary text here with \\\\n\\\\n for blank lines if dual chapters"}

────────────────────────────────────────
VALIDATION CHECKLIST
────────────────────────────────────────

Before responding, verify:
✓ Language matches subject (Hindi/Sanskrit/English)
✓ Dual chapters separated by \\n\\n if "/" detected
✓ No titles, headings, or labels
✓ Plain paragraph format only
✓ Response starts with { and ends with }
✓ Valid JSON syntax

If ANY check fails → Regenerate completely.

Return ONLY the JSON object now.
`.trim();
  }

  return `
You are a JSON API. Return ONLY valid JSON. No markdown, no code blocks, no explanations.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

────────────────────────────────────────
TASK
────────────────────────────────────────

Write a short NCERT-style chapter summary in 3-4 simple sentences.
Must be crisp, student-friendly, and useful for last-minute revision.

────────────────────────────────────────
CONTENT RULES
────────────────────────────────────────

✓ Write as ONE flowing paragraph (3-4 sentences)
✓ Use simple, clear language
✓ Focus on key concepts only

DO NOT include:
- Formulas or mathematical expressions
- Numerical examples or calculations
- Derivations or proofs
- Diagrams or table descriptions
- Definitions (just explain the concept)
- Bullet points or line breaks between sentences
- Headings or section labels

────────────────────────────────────────
JSON FORMAT (ABSOLUTE REQUIREMENT)
────────────────────────────────────────

CRITICAL: Your response must START with { and END with }

NO text before the JSON
NO text after the JSON
NO markdown code blocks like \`\`\`json
Return as single-line minified JSON

────────────────────────────────────────
REQUIRED OUTPUT FORMAT
────────────────────────────────────────

{"summary":"Your 3-4 sentence paragraph summary here"}

────────────────────────────────────────
VALIDATION CHECKLIST
────────────────────────────────────────

Before responding, verify:
✓ Summary is 3-4 sentences in one paragraph
✓ No formulas, no bullets, no formatting
✓ Plain text only
✓ Response starts with { and ends with }
✓ Valid JSON syntax

If ANY check fails → Regenerate completely.

Return ONLY the JSON object now.
`.trim();
});

      // 3️⃣ CALL OPENAI
      const aiRaw = await step.run("Call OpenAI" ,async () => {
        return await askOpenAI(prompt);
      });

      // 4️⃣ EXTRACT JSON (your extractor)
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      // 5️⃣ SANITIZE
      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // 6️⃣ SAVE DB
      await step.run("Save DB", async () => {
        await LastMinuteSummaryModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: safeParsed,
        });
      });

      // 7️⃣ SAVE REDIS (so future requests are fast)
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(safeParsed), { EX: 60 * 60 * 24 * 2 });
      });

      await redis.del(`lmp:summary:pending:${className}:${mainSubject}:${chapter}`);

      // 8️⃣ RETURN result (must be JSON-serializable)
      return { summary: safeParsed, source: "generated" };

    } catch (err) {
      redis.del(pendingKey);
      throw new Error(`generateSummary error: ${err.message}`);
    }
  }
);
