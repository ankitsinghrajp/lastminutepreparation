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
    "chapter": "string",
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

const chapterWiseStudy = asyncHandler(async (req, res) => {
    const { className, subject, chapter, index } = req.body;

    if ([className, subject, chapter].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "className, subject, and chapter are required!");
    }

    // Format topics for prompt
    const topicList = Array.isArray(index) && index.length > 0 
        ? JSON.stringify(index) 
        : "null";

    const prompt = `You are a CBSE Board Exam Expert who writes answers in SIMPLE, CLEAR ENGLISH that students can write EXACTLY as given and score FULL MARKS.

**CRITICAL REQUIREMENTS:**
1. Generate EXACTLY 10 OR MORE sections (NEVER less than 10)
2. Cover ALL exam-critical topics from the chapter
3. Write in SIMPLE English - easy words, short sentences, clear meaning
4. Answers should be EXAM-READY - students can copy word-by-word in exams
5. Return PURE JSON ONLY (no markdown, no backticks, no explanatory text)

**INPUT DATA:**
- Class: ${className}
- Subject: ${subject}  
- Chapter: ${chapter}
- Specific Topics: ${topicList || 'Cover all major topics'}

**MANDATORY JSON STRUCTURE:**
{
  "sections": [
    {
      "title": "<Topic/Concept Name>",
      "examImportance": "critical|high|medium",
      "marksWeightage": "<Expected marks: 1/2/3/5>",
      "previousYearFrequency": "<How often asked in last 5 years>",
      "topics": [
        {
          "name": "<Main Concept>",
          "subtopics": [
            {
              "title": "<Subtopic Name>",
              "type": "concept|formula|definition|derivation|numerical|diagram|theory",
              "content": {
                "summary": "<3-4 lines explanation in SIMPLE English. Use easy words. Short sentences. Clear meaning. Students can write this EXACTLY in exam.>",
                "formula": "<Mathematical expression if applicable>",
                "keyTerms": ["<Term1>", "<Term2>", "<Term3>"],
                "ncertDefinition": "<Exact NCERT definition - word by word>",
                "simpleDefinition": "<Same meaning but SIMPLE words - exam ready answer>",
                "exampleProblem": "<Solved example with clear steps in simple English>",
                "diagramTip": "<Clear drawing instructions>",
                "commonMistakes": ["<Mistake 1>", "<Mistake 2>", "<Mistake 3>"],
                "examTip": "<Marking scheme tip in clear English>",
                "answerFormat": "<Step 1: Write definition. Step 2: Give example. Step 3: Conclude.>"
              }
            }
          ]
        }
      ],
      "comparativeTables": [
        {
          "title": "<Comparison Topic>",
          "examRelevance": "<Why this is asked in exams>",
          "headers": ["Basis", "Concept A", "Concept B"],
          "rows": [
            {"Basis": "<Point>", "Concept A": "<Clear answer>", "Concept B": "<Clear answer>"}
          ]
        }
      ],
      "importantQuestions": [
        {
          "question": "<Expected board exam question>",
          "marks": "<1/2/3/5>",
          "modelAnswer": "<COMPLETE answer in simple English that student can write directly>",
          "answerStructure": "<How to organize the answer for full marks>"
        }
      ]
    }
  ],
  "formulaSheets": [
    {
      "title": "<Formula Name>",
      "expression": "<Mathematical Expression>",
      "derivationRequired": true|false,
      "explanation": "<What this formula means - simple English>",
      "variables": [
        {"symbol": "<S>", "meaning": "<Clear description>", "unit": "<SI Unit>"}
      ],
      "mustMemorize": true|false,
      "howToApply": "<When and how to use this formula - clear steps>",
      "examTip": "<Common mistakes to avoid>"
    }
  ],
  "quickRevisionPoints": [
    "<Clear fact in simple English - exam ready>",
    "<Important point - can be written directly>",
    "<Key concept - simple words>"
  ],
  "definitionsToMemorize": [
    {
      "term": "<Term>",
      "officialDefinition": "<Exact NCERT definition>",
      "simpleVersion": "<Same meaning, simpler words, exam acceptable>",
      "marks": "1|2",
      "writingTip": "<Start with 'It is defined as...' OR 'It refers to...'>",
      "mustInclude": "<Key phrases needed for full marks>"
    }
  ],
  "numericalProblems": [
    {
      "topic": "<Related topic>",
      "difficultyLevel": "easy|medium|hard",
      "formulasUsed": ["<Formula 1>", "<Formula 2>"],
      "solutionSteps": "<Step 1: Write given values. Step 2: Write formula. Step 3: Calculate. Step 4: Write answer with unit.>",
      "commonErrors": ["<Error 1>", "<Error 2>"]
    }
  ],
  "diagramsRequired": [
    {
      "title": "<Diagram name>",
      "labelsRequired": ["<Label 1>", "<Label 2>"],
      "marks": "<Diagram marks>",
      "stepByStepDrawing": "<First draw this. Then add that. Label these parts.>"
    }
  ],
  "sampleAnswers": [
    {
      "questionType": "<1 mark/2 mark/3 mark/5 mark>",
      "sampleQuestion": "<Typical exam question>",
      "perfectAnswer": "<Complete answer in simple English - student can copy exactly>",
      "whyThisWorks": "<Why this answer gets full marks>"
    }
  ],
  "lastMinuteTips": [
    "<Exam writing tip in clear English>",
    "<Time management advice>",
    "<Scoring strategy>"
  ]
}

**LANGUAGE RULES (VERY IMPORTANT):**
1. **Simple words ONLY**: Use "use" not "utilize", "show" not "demonstrate", "change" not "transform"
2. **Short sentences**: Maximum 15 words per sentence
3. **Clear meaning**: Every sentence should be easy to understand on first reading
4. **No complex words**: Avoid "consequently", "predominantly", "facilitate", "subsequent"
   Use instead: "so", "mainly", "help", "next"
5. **Active voice**: "We calculate the area" not "The area is calculated"
6. **Direct statements**: "This is important because..." not "The significance of this lies in..."
7. **EXAM-READY**: Every explanation should be something a student can write word-by-word in exam

**WRITING STYLE EXAMPLES:**

❌ TOO COMPLEX: "The phenomenon occurs due to the molecular interaction between various constituents."
✅ SIMPLE & EXAM-READY: "This happens because molecules interact with each other."

❌ TOO COMPLEX: "Subsequently, we must ascertain the resultant magnitude."
✅ SIMPLE & EXAM-READY: "Next, we need to find the total value."

❌ TOO COMPLEX: "This principle is fundamental to comprehending thermodynamic processes."
✅ SIMPLE & EXAM-READY: "This basic rule helps us understand how heat works."

**ANSWER FORMAT GUIDELINES:**
1. Definitions: Start with "It is defined as..." or "It refers to..."
2. Explanations: Use "This means that..." or "In simple terms..."
3. Examples: Use "For example," or "Consider..."
4. Conclusions: Use "Therefore," or "Thus," or "Hence,"
5. Comparisons: Use "On the other hand," or "In contrast,"

**STRICT CONTENT RULES:**
1. **MINIMUM 10 SECTIONS** - Cover every exam-important topic
2. Keep NCERT definitions exact, but provide simple version too
3. Focus on last 5 years CBSE question patterns
4. All answers should be in British English spelling (colour, organisation, etc.)
5. Include complete model answers for different mark questions
6. Add "sampleAnswers" showing perfect exam responses
7. Every explanation must be exam-acceptable and scoring

**EXAM-FOCUSED:**
- Class 9-10: Extra simple language, basic concepts
- Class 11-12: Can use standard scientific terms but keep sentences simple
- All content must be: Clear + Correct + Complete + Can be written in exam

**OUTPUT:** Pure JSON object only (validate JSON syntax before returning)`;

    // Call OpenAI API
      // Call OpenAI API
    const apiData = await askOpenAI(prompt);

    let revisionGuide;
    try {
        // Clean and parse JSON safely
        const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        revisionGuide = JSON.parse(cleaned);

        // --- ✅ Auto-fill missing arrays (prevents crash) ---
        revisionGuide.sections = revisionGuide.sections || [];
        revisionGuide.formulaSheets = revisionGuide.formulaSheets || [];
        revisionGuide.quickRevisionPoints = revisionGuide.quickRevisionPoints || [];
        revisionGuide.definitionsToMemorize = revisionGuide.definitionsToMemorize || [];
        revisionGuide.numericalProblems = revisionGuide.numericalProblems || [];
        revisionGuide.diagramsRequired = revisionGuide.diagramsRequired || [];
        revisionGuide.sampleAnswers = revisionGuide.sampleAnswers || [];
        revisionGuide.lastMinuteTips = revisionGuide.lastMinuteTips || [];

        // --- ✅ Non-breaking validation (for logging only) ---
        const requiredFields = [
            'sections',
            'formulaSheets',
            'quickRevisionPoints',
            'definitionsToMemorize'
        ];
        const missingFields = requiredFields.filter(field => !revisionGuide[field]);
        if (missingFields.length > 0) {
            console.warn("⚠️ Missing fields in AI response:", missingFields.join(", "));
        }

        // --- ✅ Ensure arrays are valid ---
        if (!Array.isArray(revisionGuide.sections) || revisionGuide.sections.length === 0) {
            console.warn("⚠️ 'sections' is empty or invalid.");
        }

    } catch (error) {
        console.error("❌ Error parsing AI response:", error);
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

const importantQuestionGenerator = asyncHandler(async (req, res) => {
    const { className, subject, chapter, index } = req.body;

    if ([className, subject, chapter].some((f) => !f || f.trim() === "")) {
        throw new ApiError(400, "className, subject, chapter are required!");
    }

    const topics = Array.isArray(index) && index.length > 0 ? JSON.stringify(index) : "All key topics";

    const prompt = `
You are a CBSE Exam Expert. Generate ONLY HIGH-VALUE QUESTIONS that come frequently in CBSE Boards.

Return **VALID JSON only** (no markdown, no backticks).

INPUT:
Class: ${className}
Subject: ${subject}
Chapter: ${chapter}
Topics: ${topics}

OUTPUT JSON STRUCTURE:
{
  "chapter": "<chapter name>",
  "whyImportant": "<2 lines explaining why this chapter is important for exam>",
  
  "pastYearPatterns": [
    {
      "questionType": "1-mark | 2-mark | 3-mark | 5-mark",
      "frequency": "High | Medium | Low",
      "trend": "How often asked in last 5 years",
      "notes": "short insight"
    }
  ],

  "importantQuestions": [
    {
      "question": "<Most expected question>",
      "marks": "<1/2/3/5>",
      "whyThisIsImportant": "<1–2 lines>",
      "keywords": ["keyword1", "keyword2"],
      "modelAnswer": "<Simple English answer written exactly like exam>"
    }
  ],

  "mustPracticeNumericals": [
    {
      "question": "<numerical question if subject needs>",
      "marks": "<2/3/5>",
      "formulaUsed": ["formula1", "formula2"],
      "solutionSteps": "Step 1: ... Step 2: ... Step 3: ...",
      "commonMistake": "<common student mistake>"
    }
  ],

  "veryShortQuestions": [
    {
      "question": "<1 mark conceptual question>",
      "answer": "<crisp answer>",
      "keywords": ["term1"]
    }
  ],

  "longAnswerQuestions": [
    {
      "question": "<expected 5-mark or derivation question>",
      "structure": "Intro → Point 1 → Point 2 → Diagram → Conclusion",
      "modelAnswer": "<full answer student can copy>",
      "diagramTip": "<if diagram needed>"
    }
  ],

  "examStrategy": {
    "howToAttempt": ["tip1", "tip2"],
    "mustRevise": ["topic1", "topic2"],
    "avoidMistakes": ["mistake1", "mistake2"]
  }
}

Requirements:
- Minimum 20 important questions.
- All answers in simple CBSE-friendly language.
- No complex words.
- All JSON must be strictly valid.
`;

    // CALL OPENAI
    const apiData = await askOpenAI(prompt);

    let finalQuestions;
    try {
        const clean = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        finalQuestions = JSON.parse(clean);

        const required = [
            "chapter",
            "whyImportant",
            "pastYearPatterns",
            "importantQuestions",
            "veryShortQuestions",
            "longAnswerQuestions",
            "examStrategy"
        ];

        const missing = required.filter(f => !finalQuestions[f]);
        if (missing.length > 0) {
            throw new Error("Missing required fields: " + missing.join(", "));
        }

    } catch (err) {
        throw new ApiError(500, "Failed to parse AI response: " + err.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: finalQuestions },
            "Important Question Set Generated Successfully! 🔥"
        )
    );
});

const quizMcqFillupTrueFalse = asyncHandler(async (req, res) => {
    const { className, subject, chapter, index } = req.body;

    if (!className || !subject || !chapter) {
        throw new ApiError(400, "className, subject and chapter are required");
    }

    const topics = Array.isArray(index) && index.length > 0 ? JSON.stringify(index) : "All key topics";

    const prompt = `
You are a CBSE Exam Expert. Generate ONLY HIGH-VALUE questions from the chapter.
Include MCQs, Fillups, and True/False with answers.

INPUT:
- Class: ${className}
- Subject: ${subject}
- Chapter Name: ${chapter}
- Topics: ${topics}

REQUIREMENTS:
1. Generate 15 to 20 VERY IMPORTANT questions in total.
2. Include all 3 types:
   - "mcq" (minimum 7)
   - "fillup" (minimum 5)
   - "true_false" (minimum 4)
3. MCQs: Provide 4 options and correct answer exactly matching one option.
4. Fillups: Use blank as "______".
5. True/False: Answer must be "True" or "False".
6. Do NOT repeat questions.
7. Return STRICT JSON ONLY. No markdown, no explanations.

OUTPUT FORMAT:
{
  "class": "${className}",
  "subject": "${subject}",
  "chapter": "${chapter}",
  "questions": [
    {
      "id": 1,
      "type": "mcq | fillup | true_false",
      "question": "<question text>",
      "options": ["A", "B", "C", "D"],
      "answer": "<correct answer>"
    }
  ]
}
`;

    // Call OpenAI using your helper
    const apiData = await askOpenAI(prompt);

    let finalQuestions;
    try {
        const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();
        finalQuestions = JSON.parse(cleaned);

        // Validate required fields
        const requiredFields = ["class", "subject", "chapter", "questions"];
        const missingFields = requiredFields.filter((f) => !finalQuestions[f]);
        if (missingFields.length > 0) {
            throw new Error("Missing required fields: " + missingFields.join(", "));
        }

        if (!Array.isArray(finalQuestions.questions) || finalQuestions.questions.length === 0) {
            throw new Error("Questions array is empty or invalid");
        }

    } catch (err) {
        console.error("❌ AI Response Parsing Error:", err);
        throw new ApiError(500, "Failed to parse AI response: " + err.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: finalQuestions },
            "MCQs + Fillups + True/False generated successfully 🔥"
        )
    );
});



export { summarizer, lastNightBeforeExam, chapterWiseStudy, importantQuestionGenerator, quizMcqFillupTrueFalse};