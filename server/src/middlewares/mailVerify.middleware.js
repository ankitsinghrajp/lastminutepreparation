import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyEmail = asyncHandler(async (req, res, next)=>{
    const user = await User.findById(req?.user?._id);
    if(!user) throw new ApiError(404,"User not found");

    if(!user?.isVerified){
        throw new ApiError(400,"Please verify your email first to access the service!");
    }

    next();
})
