import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askOpenAI } from "../utils/OpenAI.js";

const summarizer = asyncHandler(async (req, res) => {
    let { topic, level } = req.body;
    
    // Validate inputs
    if (!topic || topic.trim() === "") {
        throw new ApiError(400, "Please provide a topic to study");
    }
    
    if (!level || level.trim() === "") level = "Medium";

    // ULTIMATE CBSE LAST-MINUTE REVISION PROMPT
    const revisionPrompt = `You are a CBSE exam expert helping a student revise ONE NIGHT BEFORE THE EXAM.

**Topic:** "${topic}"
**Detail Level:** ${level} (Short = Quick revision, Medium = Balanced, Long = Deep coverage)

Your mission: Create the PERFECT last-minute revision guide for "${topic}" that maximizes exam marks.

Return ONLY valid JSON (no markdown, no extra text):
{
  "quickSummary": "${level === 'Short' ? '1-2 short paragraphs' : level === 'Medium' ? '2-3 paragraphs' : '3-4 detailed paragraphs'} explaining ${topic} using simple language and relatable examples. Make it easy to recall under exam pressure. Use everyday analogies.",
  
  "mustKnowPoints": [
    "Definition - in exact exam language (1 line)",
    "Formula/Theorem - with clear explanation (1 line)",
    "Key concept 1 - simplified (1 line)",
    "Important application/example (1 line)",
    "${level === 'Short' ? '4-6 points' : level === 'Medium' ? '6-8 points' : '8-12 points'} total - ONLY essentials that score marks"
  ],
  
  "memoryTricks": [
    "Mnemonic/Acronym - catchy way to remember main formula or concept",
    "Visual trick - simple analogy or real-world connection",
    "Pattern/Shortcut - quick way to solve or recall",
    "${level === 'Short' ? '2-3 tricks' : level === 'Medium' ? '3-4 tricks' : '4-6 tricks'} that make ${topic} stick instantly"
  ],
  
  "examIntelligence": {
    "chanceOfComing": "High/Medium/Low - Based on CBSE question paper trends and weightage",
    "whyItMatters": "1-2 lines explaining why this topic is important for marks",
    "commonQuestionFormats": [
      "Format 1: e.g., 'Derive the formula' or 'Define and explain'",
      "Format 2: e.g., 'Solve numerical' or 'Compare and contrast'",
      "Format 3: e.g., 'Draw diagram and label' or 'Give examples'",
      "List 3-4 actual question patterns from CBSE papers"
    ],
    "marksDistribution": "Usually X marks (1/2/3/5) - mention typical marking",
    "timeToSpend": "Y-Z minutes per question in exam",
    "examinerLooksFor": ["Keyword 1 they want to see", "Point 2 that gets marks", "Common thing students miss"]
  },
  
  "answeringStrategy": {
    "perfectAnswerStructure": "Step-by-step: Introduction → Point 1 → Point 2 → Example → Conclusion OR whatever format scores max marks",
    "mustInclude": ["Critical keyword 1", "Formula/definition", "Diagram/example if applicable"],
    "instantMarkLoss": ["Mistake 1 students make", "Thing 2 to never forget", "Error 3 that costs marks"],
    "proTips": ["Tip 1 for full marks", "Trick 2 for speed", "Hack 3 examiners love"]
  },
  
  "practiceQuestions": [
    {
      "question": "Most frequently asked 5-mark question on ${topic}",
      "marks": "5",
      "answerFormat": "**Introduction:** One line setting context\n**Point 1:** Explanation with formula\n**Point 2:** Application or example\n**Point 3:** Key insight or derivation\n**Conclusion:** Summary line\n\n(Show EXACT bullet/paragraph format)",
      "magicWords": "Keywords that guarantee marks: [word1, word2, word3]",
      "commonMistake": "What 80% students do wrong here"
    },
    {
      "question": "Typical 3-mark question variation",
      "marks": "3",
      "answerFormat": "• Point 1 with explanation\n• Point 2 with example\n• Point 3 with conclusion",
      "magicWords": "Must-use terms: [word1, word2]",
      "commonMistake": "Error to avoid"
    },
    "${level === 'Short' ? '2 questions' : level === 'Medium' ? '3 questions' : '4-5 questions'} covering different question types"
  ],
  
  "last10MinutesDrill": [
    "□ Memorize: [This exact formula/definition]",
    "□ Visualize: [This diagram/concept]",
    "□ Remember: [These 3 keywords for answer]",
    "□ Don't confuse: [This with that similar concept]",
    "${level === 'Short' ? '3-4 items' : level === 'Medium' ? '4-5 items' : '5-7 items'} - Quick scan checklist before entering exam hall"
  ]
}

CRITICAL INSTRUCTIONS:
1. Keep language SUPER SIMPLE - like explaining to a friend at 2 AM
2. Everything must be EXAM-READY and ACTIONABLE
3. Use CBSE answer writing style and marking scheme language
4. Include memory tricks that ACTUALLY WORK (not generic "understand the concept")
5. Show answers EXACTLY as they should appear on answer sheet
6. Focus on HIGH-YIELD content - what scores maximum marks
7. Make "examIntelligence" section data-driven based on CBSE patterns
8. In "answeringStrategy", give SPECIFIC tips, not vague advice
9. Practice questions should have REAL answer formats with proper structure
10. Everything should help a panicked student score marks FAST

Detail Level Guidance:
- Short: Quick essentials, 2-3 questions, focus on most probable content
- Medium: Balanced coverage, 3-4 questions, good tricks and strategies  
- Long: Comprehensive, 4-5 questions, deep tricks, multiple formats

Remember: This student has ONE NIGHT. Make every word count for marks! 🎯`;

    // Call OpenAI API
    const apiData = await askOpenAI(revisionPrompt);

    let revisionGuide;
    try {
        const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        revisionGuide = JSON.parse(cleaned);

        // Validate structure
        if (!revisionGuide.quickSummary || !revisionGuide.mustKnowPoints || 
            !revisionGuide.memoryTricks || !revisionGuide.examIntelligence || 
            !revisionGuide.answeringStrategy || !revisionGuide.practiceQuestions || 
            !revisionGuide.last10MinutesDrill) {
            throw new Error("Invalid response structure - missing required fields");
        }
    } catch (error) {
        throw new ApiError(500, "Failed to parse AI response: " + error.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            { data: revisionGuide }, 
            "Last-Minute Revision Guide Ready! 🎯"
        )
    );
});

const lastNightBeforeExam = asyncHandler(async (req, res) => {
    const { className, subject, chapter, index } = req.body;

    if ([className, subject, chapter].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required!");
    }

    const prompt = `Generate a CBSE Class 12 exam revision sheet as valid JSON only (no markdown/explanations).

INPUT: Class: ${className}, Subject: ${subject}, Chapter: ${chapter}, Topics: ${index}
Note: Topics may or may not present
JSON STRUCTURE:
{
  "ChapterOverview": {
    "chapterName": "string",
    "keyTheme": "one-line summary",
    "examWeightage": "marks range",
    "timeToRevise": "minutes"
  },
  "QuickConcepts": [
    {
      "topic": "string",
      "priority": "High/Medium/Low",
      "points": ["3-5 concise points"],
      "examTip": "strategy"
    }
  ],
  "FormulasAndEquations": [
    {
      "concept": "string",
      "formula": "plain text (e.g., E=mc^2)",
      "unit": "SI unit",
      "application": "when to use",
      "commonError": "what students miss"
    }
  ],
  "KeyDiagramsDerivations": [
    {
      "name": "string",
      "type": "diagram/derivation",
      "marks": "typical marks",
      "criticalPoints": ["2-3 points"]
    }
  ],
  "CommonConfusions": [
    {
      "misconception": "wrong belief",
      "correct": "right understanding",
      "trick": "memory aid"
    }
  ],
  "MustKnowDefinitions": [
    {
      "term": "string",
      "definition": "exam-ready (<30 words)",
      "example": "brief example"
    }
  ],
  "PracticeQuestionsByMarks": [
    {
      "markType": "1-mark",
      "questionType": "MCQ",
      "questions": [
        {
          "question": "question text",
          "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
          "correctAnswer": "B",
          "explanation": "why this is correct"
        }
      ]
    },
    {
      "markType": "2-mark",
      "questionType": "Short Answer",
      "questions": [
        {
          "question": "question text",
          "answer": "model answer (2-3 sentences)",
          "keywords": ["must-include terms"]
        }
      ]
    },
    {
      "markType": "3-mark",
      "questionType": "Short Answer",
      "questions": [
        {
          "question": "question text",
          "answer": "model answer (3-4 sentences or 3 points)",
          "keywords": ["must-include terms"]
        }
      ]
    },
    {
      "markType": "4-mark",
      "questionType": "Case-Based",
      "questions": [
        {
          "case": "scenario/passage (2-3 lines)",
          "subQuestions": [
            {
              "question": "sub-question",
              "answer": "answer",
              "marks": "marks for this sub-question"
            }
          ]
        }
      ]
    },
    {
      "markType": "5-mark",
      "questionType": "Long Answer",
      "questions": [
        {
          "question": "question text",
          "answer": "detailed answer with 5-6 points or derivation steps",
          "diagram": "mention if diagram needed",
          "keywords": ["must-include terms"]
        }
      ]
    },
    {
      "markType": "6-mark",
      "questionType": "Long Answer/Derivation",
      "questions": [
        {
          "question": "question text",
          "answer": "comprehensive answer with derivation/explanation",
          "diagram": "mention if diagram needed",
          "keywords": ["must-include terms"]
        }
      ]
    }
  ],
  "ComparisonTables": [
    {
      "title": "comparing what",
      "columns": ["Parameter", "Item A", "Item B"],
      "rows": [["param", "val A", "val B"]]
    }
  ],
  "MindMap": {
    "central": "chapter name",
    "branches": [
      {
        "topic": "Major Topic",
        "subtopics": [
          {"name": "Subtopic", "points": ["key points"]}
        ]
      }
    ]
  },
  "RevisionChecklist": ["5-7 timed tasks with minutes"],
  "ExamStrategy": {
    "mcqTips": ["elimination techniques", "keyword spotting"],
    "shortAnswerTips": ["point-based writing", "keyword usage"],
    "caseBasedTips": ["data interpretation", "linking to theory"],
    "longAnswerTips": ["structure", "diagram placement", "time management"],
    "lastHour": ["focus areas"],
    "avoid": ["time wasters"],
    "examHall": ["during-exam tips"]
  }
}

REQUIREMENTS:
- PracticeQuestionsByMarks: Include 3-5 questions for each mark type (1, 2, 3, 4, 5, and 6 if applicable to subject)
- 1-mark: Always MCQ format with 4 options
- 2-3 mark: Short answer format with model answers
- 4-mark: Case-based with passage and 2-3 sub-questions
- 5-6 mark: Long answer/derivation with step-by-step solutions
- All answers should be exam-ready (can be written directly in exam)
- Include marking scheme hints (e.g., "1 mark for definition + 1 mark for example")
- Focus on frequently asked question patterns
- MCQs: include explanation for correct answer
- Keywords array: terms that earn marks
- 6-10 concepts, 6-12 formulas, 3-6 diagrams, 4-8 confusions, 5-10 definitions
- Skip ComparisonTables if not relevant
- Skip 6-mark questions if not applicable to the subject
- Student-friendly language, exam-focused only

Return ONLY valid JSON (no trailing commas, proper quotes).`;

    // Call OpenAI API
    const apiData = await askOpenAI(prompt);

    let revisionGuide;
    try {
        const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        revisionGuide = JSON.parse(cleaned);

        // Validate structure
        const requiredFields = [
            'ChapterOverview', 'QuickConcepts', 'FormulasAndEquations',
            'KeyDiagramsDerivations', 'CommonConfusions', 'MustKnowDefinitions',
            'PracticeQuestionsByMarks', 'MindMap', 'RevisionChecklist', 'ExamStrategy'
        ];
        
        const missingFields = requiredFields.filter(field => !revisionGuide[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate PracticeQuestionsByMarks has questions
        if (!Array.isArray(revisionGuide.PracticeQuestionsByMarks) || 
            revisionGuide.PracticeQuestionsByMarks.length === 0) {
            throw new Error("PracticeQuestionsByMarks must contain questions");
        }
    } catch (error) {
        throw new ApiError(500, "Failed to parse AI response: " + error.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: revisionGuide },
            "Last-Minute Revision Guide with Practice Questions Ready! 🎯"
        )
    );
});
export { summarizer, lastNightBeforeExam };