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



export { summarizer };