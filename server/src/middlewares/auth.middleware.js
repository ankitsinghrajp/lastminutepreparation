import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req,res,next)=>{
    try {
          const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","");
        if(!token) {
            throw new ApiError(401,"Unauthorized Requiest!");
        }
    
          const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
          
          const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
          if(!user) throw new ApiError(401,"Unauthorized Request!");
          
          req.user = user;
          next();
    } catch (error) {
        throw new ApiError(500,"Something went wrong while authenticating the user!");
    }
})

export {verifyJWT};