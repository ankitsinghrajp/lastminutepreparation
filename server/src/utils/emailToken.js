import crypto from "crypto";
import { User } from "../models/user.model.js";

export const createEmailVerification = async (userId)=>{
    // create plain token
    const token = crypto.randomBytes(32).toString('hex'); // 64 hex chars

    // hash to store
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // expiry
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    
    await User.findByIdAndUpdate(userId,
          {
            $set:{
                emailVerificationTokenHash: tokenHash,
                emailVerificationExpire: expires
            },
          },
          {
            new:true,
          },
    );
    return token;  // plain token to email
}