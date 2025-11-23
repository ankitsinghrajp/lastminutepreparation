import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectCategory, parseSubject } from "../utils/helper.js";
import { askOpenAI } from "../utils/OpenAI.js";

const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  // Extract only JSON object
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON found.");

  let jsonString = text.substring(first, last + 1);

  jsonString = jsonString.replace(/\\/g, "\\\\");

  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};

const LastMinutePanelSummary = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Think silently but DO NOT show your internal thinking.

Write a short NCERT-style chapter summary in **3–4 simple lines** only.
It must be crisp, student-friendly, and useful for last-minute revision.

❌ Do NOT include formulas, numericals, derivations, diagrams, definitions, tables, or headings.
❌ Do NOT use bullet points, lists, or line breaks after every sentence.
✔ The summary must be a **single flowing paragraph of 3–4 lines** only.

Return output in JSON format ONLY:
{
  "summary": "3–4 line paragraph here"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`;

  try {
    const output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Summary Ready"));
  } catch (error) {
    console.error("Summary generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to generate summary. Please try again."
        )
      );
  }
});

const LastMinutePanelImportantTopics = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Think internally first, but DO NOT show your thinking.

Your ONLY task is to generate the 6 most important exam topics from this NCERT chapter.

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}

GENERAL RULES:
- Focus only on CBSE-style exam content.
- Keep language simple, clear, and student-friendly.
- No history, no stories, no real-life examples unless directly exam-relevant.

RULES FOR EACH TOPIC OBJECT:
- "topic": 3–7 word subtopic name ONLY. Example: "Coulomb's Law", "Electric Field Intensity".
- "explanation": 2–4 short lines in plain English, describing what it is and why it is important for exams.
  • No bullet points, no headings, no numbering.
  • You MAY include inline or block math using LaTeX, but only if really needed.
- "formula": 
  • If a key formula is associated with this topic, put ONLY the LaTeX formula here as a JSON string.
  • If no formula is needed, set "formula": "".

STRICT LATEX + JSON RULES (VERY IMPORTANT):
- All LaTeX commands MUST start with a backslash:
  ✔ \\frac, \\sqrt, \\theta, \\pi, \\epsilon_0, \\vec{E}
  ✖ frac, sqrt, theta, pi, epsilon_0 (NOT allowed)
- Formulas MUST be inside quotes because this is JSON:
  ✔ "formula": "$$ F = k \\\\frac{q_1 q_2}{r^2} $$"
- You may use:
  • "$ ... $" for short inline formulas.
  • "$$ ... $$" for display equations (each equation in its own $$ block).
- The "formula" field must contain ONLY the mathematical expression, NO sentences, NO units, NO words.
  Example (correct):
    "formula": "$$ E = \\\\frac{1}{4 \\\\pi \\\\epsilon_0} \\\\frac{q}{r^2} $$"
- NEVER output bare $$ ... $$ outside of quotes. JSON MUST stay valid.
- NEVER escape slashes twice. Use \\\\frac inside JSON (so that the final value is \\frac).

TOPIC COUNT + STRUCTURE VALIDATION:
- You MUST return EXACTLY 6 topics — not more, not less.
- Output must have this exact structure:

{
  "topics": [
    {
      "topic": "...",
      "explanation": "...",
      "formula": "..."
    }
  ]
}

- Do NOT add any other keys at root level or inside topic objects.
- Do NOT output markdown, comments, prose, or any text before or after the JSON.

IF ANY RULE IS BROKEN (invalid LaTeX, wrong JSON, missing fields, wrong topic count),
you MUST internally fix and regenerate UNTIL everything satisfies all rules.

OUTPUT: ONLY the final JSON object. No backticks, no markdown, no extra text.
`;

  try {
    // Call your OpenAI wrapper – NO extra escaping of backslashes
    const output = await askOpenAI(prompt);

    // Your existing JSON extractor
    const parsed = extractJSON(output);

    // Runtime validation (extra safety)
    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      throw new Error("Invalid topics format: 'topics' must be an array.");
    }

    if (parsed.topics.length !== 6) {
      throw new Error(`Invalid topics count: expected 6, got ${parsed.topics.length}.`);
    }

    parsed.topics.forEach((topic, idx) => {
      if (
        !topic ||
        typeof topic.topic !== "string" ||
        typeof topic.explanation !== "string" ||
        typeof topic.formula !== "string"
      ) {
        throw new Error(`Invalid topic structure at index ${idx}`);
      }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Important Topics Ready"));
  } catch (error) {
    console.error("Topics generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to generate topics. Please try again."
        )
      );
  }
});

const LastMinutePanelQuickShots = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Think first. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

Formula Rule:
- Use pure LaTeX.
- "" if not needed.

TASK:
Generate 8–10 quick revision shots.

JSON:
{
  "shots":[
      {
        "type":"definition|formula|diagram|law|trick",
        "content":"..."
      }
  ]
}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    const validTypes = ["definition", "formula", "diagram", "law", "trick"];

    parsed.shots.forEach((shot, idx) => {
      if (!shot.type || !shot.content)
        throw new Error(`Invalid shot structure at index ${idx}`);

      if (!validTypes.includes(shot.type))
        throw new Error(`Invalid shot type "${shot.type}" at index ${idx}`);
    });

    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Quick Shots Ready"));
  } catch (error) {
    console.error("Quick shots generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "Failed to generate quick shots. Please try again.")
      );
  }
});

const LastMinutePanelPredictedQuestions = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Think internally first. Respond ONLY with JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

- If formula is needed: provide ONLY LaTeX (pure). Otherwise formula = "".

TASK:
Generate EXACTLY 5-7 exam-style predicted Questions for CBSE boards.
Questions must be high-probability and concept-based (This questions should be of ncert back questions or pyqs for cbse exam).

JSON FORMAT (STRICT):
{
  "questions":[
    {
      "question":"...",
      "formula":""
    }
  ]
}
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

const LastMinutePanelMCQs = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

Formula Rule: pure LaTeX only.

TASK:
Generate EXACTLY 5 MCQs.

JSON:
{
  "mcqs":[
    {
      "question":"...",
      "options":["...","...","...","..."],
      "correct":"...",
      "explanation":"...",
      "formula":""
    }
  ]
}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    parsed.mcqs.forEach((mcq, idx) => {
      if (!mcq.question || !mcq.correct || !mcq.options)
        throw new Error(`Invalid MCQ structure at ${idx}`);

      if (!Array.isArray(mcq.options) || mcq.options.length !== 4)
        throw new Error(`MCQ ${idx} must contain exactly 4 options`);

      if (!mcq.options.includes(mcq.correct))
        throw new Error(`Correct answer mismatch in MCQ ${idx}`);
    });

    return res.status(200).json(new ApiResponse(200, parsed, "MCQs Ready"));
  } catch (error) {
    console.error("MCQs generation failed:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to generate MCQs."));
  }
});

const LastMinutePanelMemoryBooster = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Chapter: ${chapter}
NCERT Book: ${bookName} | Stream: ${category}

TASK:
Generate EXACTLY 3 boosters:
1) acronym
2) story
3) pattern

Formula Rule:
- Use pure LaTeX only.

JSON:
{
  "boosters":[
    {"type":"acronym","content":"...","formula":""},
    {"type":"story","content":"...","formula":""},
    {"type":"pattern","content":"...","formula":""}
  ]
}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    return res
      .status(200)
      .json(new ApiResponse(200, parsed, "Memory Booster Ready"));
  } catch (error) {
    console.error("Memory booster generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "Failed to generate memory boosters.")
      );
  }
});

const LastMinutePanelAICoach = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Give EXACTLY 6 revision steps.

JSON:
{
  "steps":[
     {"priority":1,"action":"...","formula":""}
  ]
}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    parsed.steps.sort((a, b) => a.priority - b.priority);

    return res.status(200).json(new ApiResponse(200, parsed, "AI Coach Ready"));
  } catch (error) {
    console.error("AI coach generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "Failed to generate coaching steps.")
      );
  }
});

export {
  LastMinutePanelSummary,
  LastMinutePanelImportantTopics,
  LastMinutePanelQuickShots,
  LastMinutePanelPredictedQuestions,
  LastMinutePanelMCQs,
  LastMinutePanelMemoryBooster,
  LastMinutePanelAICoach,
};
