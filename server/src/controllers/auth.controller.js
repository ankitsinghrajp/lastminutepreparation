import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import { generateAccessAndRefreshToken } from "./user.controller.js";
import { cookieOptions } from "../../constants.js";
import { ApiError } from "../utils/APIError.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      
      user = await User.create({
        name,
        email,
        isGoogleUser: true,
        isVerified: true,
        password: null,
      });
    } else {
      
      if (!user.isVerified) {
        user.isVerified = true; 
        await user.save();
      }

      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        await user.save();
      }
    }

    if (!user?._id) throw new ApiError(400, "Google login failed!");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: "Google login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          planType: user.planType,
          isGoogleUser: user.isGoogleUser,
          isVerified: user.isVerified,
          accessToken,
          refreshToken,
        },
      });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(400).json({
      success: false,
      message: "Invalid Google token or login failed",
    });
  }
};


