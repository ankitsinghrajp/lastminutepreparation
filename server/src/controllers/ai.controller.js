import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askGemini } from "../utils/geminiAi.js";
// import { askOpenAI } from "../utils/OpenAI.js";

const summarizer = asyncHandler( async (req,res)=>{
    let {topic, level} = req.body;
    if(!topic || topic.trim() == "") throw new ApiError(400,"Please provide prompt first!");

    if(!level || level.trim() ==""){
        level = "Medium";
    }

    const summaryPrompt = `You are a CBSE subject expert helping students revise one day before exams. 
The student will provide a topic and a detail level.

Topic: "${topic}"  
Detail Level: "${level}" (choose one: short, medium, detailed)

Generate a precise, exam-focused revision summary in **strict JSON format only** like this:

{
  "summary": "This is the main summary text that will be displayed in the summary section. It can be multiple paragraphs and will be displayed as-is with line breaks preserved.",
  "keyPoints": [
    "First key point about the topic",
    "Second important point to remember",
    "Third crucial insight",
    "Fourth key takeaway",
    "Fifth important concept"
  ],
  "questions": [
    "What is the main concept discussed in this topic?",
    "How does this apply to real-world scenarios?",
    "What are the key differences between X and Y?",
    "Why is this concept important?",
    "What are the practical applications?"
  ]
}

Instructions:
1. Provide only the JSON, nothing else.
2. The "summary" should be concise, exam-focused, and easy to understand.  
3. "keyPoints" should list the 5 most crucial points, formulas, or rules for quick last-minute revision.  
4. "questions" should include 5 short exam-style questions that students might be asked.  
5. Do not add greetings, motivational text, or extra explanations outside the JSON.  
6. Adjust the content according to the topic and the detail level provided.  

Output **must be valid JSON** without any extra text or commentary.`

    const apiData = await askGemini(summaryPrompt);

       // Step 1: Remove ```json and ``` backticks
      const cleaned = apiData.replace(/```json/g, "").replace(/```/g, "").trim();

       // Step 2: Parse into actual JSON
       const summary = JSON.parse(cleaned);
    return res
    .status(200)
    .json(
        new ApiResponse(200,{data:summary},"Summarized Successfully!")
    )
})

export {summarizer}