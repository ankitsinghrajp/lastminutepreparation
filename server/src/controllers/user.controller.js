import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../../constants.js";
import { createEmailVerification } from "../utils/emailToken.js";
import { sendVerificationEmail } from "../utils/mailer.js";
import crypto from "crypto";

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

     const token = await createEmailVerification(createdUser._id);

     try {
        await sendVerificationEmail(createdUser.email, token, createdUser._id.toString());
         return res
         .status(201)
         .cookie("accessToken", accessToken, cookieOptions)
         .cookie("refreshToken", refreshToken, cookieOptions)
         .json(
         new ApiResponse(200,createdUser,"Registered. Check email to verify.")
         )

     } catch (error) {
        await User.findByIdAndUpdate(createdUser._id,{
            $set:{
                emailVerificationTokenHash:undefined,
                emailVerificationExpire: undefined,
            }
        })
       
        throw new ApiError(500,"Failed to send verification email!");
     }
    
})

const earlyUserRegister = asyncHandler(async (req,res)=>{
    const {email} = req.body;
    if(!email) throw new ApiError(500,"Email is required!");

    const existingUser = await User.findOne({
        email
    });

    if(existingUser) throw new ApiError(500,"This email is already registered with us. Click on upper 3 dots and open in chrome then login with google!");
    
    const user = await User.create({
        name:email,
        email,
        password:email
    });
    
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

      
    if(!createdUser){
        throw new ApiError(500,"Server is busy while registering user. Try Again!");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(createdUser._id);

          try {
         return res
         .status(201)
         .cookie("accessToken", accessToken, cookieOptions)
         .cookie("refreshToken", refreshToken, cookieOptions)
         .json(
         new ApiResponse(200,createdUser,"User Registration Successfull!")
         )

     } catch (error) {
        await User.findByIdAndUpdate(createdUser._id,{
            $set:{
                emailVerificationTokenHash:undefined,
                emailVerificationExpire: undefined,
            }
        })
     }
    
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

const verifyEmailController = asyncHandler(async (req,res)=>{
    const {token,id} = req.query;

    if(!token || !id) throw new ApiError(401,"Missing token or userId");
    // Find user by id
    const user = await User.findById(id);

    if(!user || !user.emailVerificationTokenHash){
        throw new ApiError(400,"Invalid or expired Token!");
    }

    if(user.emailVerificationExpire < new Date()){
        throw new ApiError(400,"The token has expired!");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    if(tokenHash !== user.emailVerificationTokenHash) {
        throw new ApiError(400,"Invalid Token");
    }

    user.isVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();
   
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    return res
    .status(200)
    .json(
        new ApiResponse(200,{user:createdUser},"Email Verified Successfully!")
    )
})

const resendEmail = asyncHandler(async (req,res)=>{
    const user = await User.findById(req?.user?._id);
    if(!user) throw new ApiError(400,"Login first to resend email!");

    const token = await createEmailVerification(user?._id);

       try {
        await sendVerificationEmail(user.email, token, user._id.toString());
         return res
         .status(201)
         .json(
         new ApiResponse(200,{},"Email sent successfully! Check email to verify.")
         )

     } catch (error) {
        await User.findByIdAndUpdate(user._id,{
            $set:{
                emailVerificationTokenHash:undefined,
                emailVerificationExpire: undefined,
            }
        })
        throw new ApiError(500,"Failed to send verification email!");
     }

})

const checkPlanExpiry = asyncHandler (async (req,res) => {
    const user = await User.findById(req.user._id);
    if (!user) return;
    if (user.planExpiry && new Date()  > new Date(user.planExpiry)) {
        // Subscription expired → downgrade to FREE
        user.planType = "FREE";
        user.planExpiry = null; // reset expiry
        await user.save();
    }

    return res.status(200).json({
        success:true,
    })
});


export {registerUser, loginUser, logoutUser, refreshAccessToken, verifyEmailController, resendEmail, checkPlanExpiry, earlyUserRegister};