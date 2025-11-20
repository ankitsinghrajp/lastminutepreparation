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
You are an API. First think internally about the NCERT chapter.
Then output ONLY valid JSON. No markdown, no backticks.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 3 short points:
1. What students learn (1 simple sentence)
2. Top 3 key concepts (comma-separated)
3. Common exam focus areas (1 sentence)

JSON ONLY:
{
  "summary":[
      "point 1",
      "point 2",
      "point 3"
  ]
}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    return res.status(200).json(new ApiResponse(200, parsed, "Summary Ready"));
  } catch (error) {
    console.error("Summary generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "Failed to generate summary. Please try again.")
      );
  }
});

const LastMinutePanelImportantTopics = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  const prompt = `
You are an API. Think internally, then output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

Formula Rule:
- Use pure LaTeX only.
- "" if no formula needed.

TASK:
List EXACTLY 6 most important exam topics.

JSON:
{
  "topics":[
      {
        "topic":"...",
        "explanation":"...",
        "formula":""
      }
  ]
}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      throw new Error("Invalid topics format");
    }

    parsed.topics.forEach((topic, idx) => {
      if (!topic.topic || !topic.explanation || topic.formula === undefined) {
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
        new ApiResponse(500, null, "Failed to generate topics. Please try again.")
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

Formula Rule:
- Use pure LaTeX.
- "" if not needed.

TASK:
Generate EXACTLY 5 exam-style Q&A.

JSON:
{
  "questions":[
    {
      "question":"...",
      "answer":"...",
      "formula":""
    }
  ]
}
`;

  try {
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    parsed.questions.forEach((q, idx) => {
      if (!q.question || !q.answer || q.formula === undefined) {
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
