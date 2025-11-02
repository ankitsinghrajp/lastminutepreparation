import { OAuth2Client } from "google-auth-library";
import {User} from "../models/user.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login Controller
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // ✅ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    // ✅ Check if user already exists
    let user = await User.findOne({ email });

    // If not, create new Google user
    if (!user) {
      user = await User.create({
        name,
        email,
        isGoogleUser: true,
        password: null,
      });
    }

    // // ✅ Generate JWT tokens
    // const accessToken = user.generateAccessToken();
    // const refreshToken = user.generateRefreshToken();

    // ✅ Return response
    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        planType: user.planType,
        isGoogleUser: user.isGoogleUser,
      }
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid Google token or login failed",
    });
  }
};


