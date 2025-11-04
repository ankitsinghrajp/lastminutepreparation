import { PYQ } from "../models/pyq.model.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPYQ = asyncHandler(async (req, res) => {
  const { standard, subject, chapter, year, question, type, options, answer, marks, priority } = req.body;

  // Basic required fields check
  if ([standard, subject, chapter, year, question, type, answer].some((field) => field === undefined || String(field).trim() === "")) {
    throw new ApiError(400, "All required fields must be provided!");
  }

  // Validate type-specific options
  if (type === "MCQ") {
    if (!options || options.length !== 4) {
      throw new ApiError(400, "MCQ questions must have exactly 4 options.");
    }
  }

  if (type === "TrueFalse") {
    // Optional: enforce only "True" or "False" in options if provided
    if (options && options.length > 2) {
      throw new ApiError(400, "True/False questions can have at most 2 options.");
    }
  }

  // Create the PYQ document
  const pyq = await PYQ.create({
    standard,
    subject,
    chapter,
    year,
    question,
    type,
    options: options || [],
    answer,
    marks: marks || null,
    priority: priority || "medium",
  });

  return res.status(200).json(new ApiResponse(200, pyq, "PYQ created successfully!"));
});

const getPYQ = asyncHandler(async (req,res)=>{
    const {standard, subject, chapter, year, type, priority, marks} = req.query;

    const filter = {};
    if(standard) filter.standard = standard;
    if(subject) filter.subject = subject;
    if(chapter) filter.chapter = chapter;
    if(year) filter.year = year;
    if(type) filter.type = type;
    if(priority) filter.priority = priority;
    if(marks) filter.marks = marks;

    // Fetch pyqs based on the filters
    const pyqs = await PYQ.find(filter).sort({year:-1}); // latest year first

    if(!pyqs || pyqs.length == 0){
        throw new ApiError(404, "No PYQs found matching your criteria!");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,pyqs,"Pyqs fetched successfully!"))
});

const bulkUploadPYQ = asyncHandler(async (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "Please provide an array of questions to upload.");
  }

  // Validate each question
  const validQuestions = questions.map((q, index) => {
    const { standard, subject, chapter, year, question, type, options, answer, marks, priority } = q;

    if ([standard, subject, chapter, year, question, type, answer].some(field => field === undefined || String(field).trim() === "")) {
      throw new ApiError(400, `Missing required fields in question at index ${index}`);
    }

    if (type === "MCQ" && (!options || options.length !== 4)) {
      throw new ApiError(400, `MCQ question at index ${index} must have exactly 4 options`);
    }

    if (type === "TrueFalse" && options && options.length > 2) {
      throw new ApiError(400, `True/False question at index ${index} can have at most 2 options`);
    }

    return {
      standard,
      subject,
      chapter,
      year,
      question,
      type,
      options: options || [],
      answer,
      marks: marks || null,
      priority: priority || "medium",
    };
  });

  // Bulk insert
  const insertedQuestions = await PYQ.insertMany(validQuestions);

  return res.status(200).json(new ApiResponse(200, insertedQuestions, `${insertedQuestions.length} questions uploaded successfully!`));
});

export {
    createPYQ,
    getPYQ,
    bulkUploadPYQ
}
