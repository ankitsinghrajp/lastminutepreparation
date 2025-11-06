import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../../constants.js";

export const generateAccessAndRefreshToken = async(userId)=>{
    
        const user = await User.findById(userId);
        if(!user) throw new ApiError(404,"Unauthorized User!");

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken, refreshToken};
}

const registerUser = asyncHandler(async (req,res)=>{
    const {name, email, password} = req.body;
    
    if([name, email, password].some((field)=> field.trim() === "")){
        throw new ApiError(400,"All fields are required!");
    }

    const existingUser = await User.findOne({
        email
    })

    if(existingUser) throw new ApiError(409, "This email is already registered with us! Try Login");

    const user = await User.create({
        name,
        email,
        password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    if(!createdUser){
        throw new ApiError(500,"Server is busy while registering user. Try Again!");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(createdUser._id);

    return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200,createdUser,"User Registration Successfull!")
    )
})

const loginUser = asyncHandler(async (req, res)=>{
     const {email, password} = req.body;
   
     if([email,password].some((field)=>field.trim() === "")){
        throw new ApiError(400,"All fields are required!");
     }
    
     const user = await User.findOne({email});
     
     if(!user) throw new ApiError(404, "User does not exist!");

     if(!user.password) throw new ApiError(400,"This account is created with google, Try Continue With Google");
     
     const isPasswordValid = await user.isPasswordCorrect(password);

     if(!isPasswordValid) throw new ApiError(401,"Invalid user credentials!");

     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

     return res
     .status(200)
     .cookie("accessToken",accessToken,cookieOptions)
     .cookie("refreshToken",refreshToken,cookieOptions)
     .json(
        new ApiResponse(200,{user:loggedInUser, accessToken, refreshToken},"User Logged In Successfull!")
     )
})

const logoutUser = asyncHandler(async(req, res)=>{
    try {
    
       await User.findByIdAndUpdate(
         req.user._id,
         {
            $set:{refreshToken:undefined}
         },
         {
            new:true
         }
    );

    return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(
        new ApiResponse(200,{},"User Logged Out!")
    );
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Internal Server Error while logging out!");
    }
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ","");
    if(!incomingRefreshToken) throw new ApiError(401,"Unauthorized Request!");
    
    const decodedUser = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedUser._id);
    if(!user) throw new ApiError(401,"Unauthorized Request!");

    if(user?.refreshToken !== incomingRefreshToken){
        throw new ApiError(401,"Invalid Refresh Token");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user?._id);
  return res
  .status(200)
  .cookie("accessToken",accessToken,cookieOptions)
  .cookie("refreshToken",refreshToken,cookieOptions)
  .json(
    new ApiResponse(200,{accessToken, refreshToken},"Access Token Refreshed!")
  );
})


export {registerUser, loginUser, logoutUser, refreshAccessToken};