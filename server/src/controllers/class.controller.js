import { ClassModel } from "../models/class.model.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getClasses = asyncHandler(async (req,res)=>{
     const classes = await ClassModel.find({},"class");
     if(!classes) throw new ApiError(400,"No classses found!");

     return res
     .status(200)
     .json(
        new ApiResponse(200,classes,"Classes fetched Successfully!")
     )
});

const getSubjects = asyncHandler(async (req,res)=>{
    const {className} = req.params;
    const classData = await ClassModel.findOne({class:className},"subjects.subject");
    if(!classData) throw new ApiError(404,"Class Not Found!");

    return res
    .status(200)
    .json(
        new ApiResponse(200,{subjects:classData.subjects},"Subjects fetched Successfully!")
    )
});

const getChapters = asyncHandler(async (req,res)=>{
    const {className, subjectName} = req.params;
    const classData = await ClassModel.findOne({class:className});
    if(!classData) throw new ApiError(404,"Class Not Found!");

    const subjectData = classData.subjects.find(sub=> sub.subject === subjectName);
    if(!subjectData) throw new ApiError(404, "Subject not found!");

    return res
    .status(200)
    .json(
        new ApiResponse(200,{chapters:subjectData.chapters})
    )
}) 

export {getClasses, getSubjects, getChapters}