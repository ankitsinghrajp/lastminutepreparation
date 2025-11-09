import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    isGoogleUser:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    emailVerificationTokenHash:{
        type:String
    },
    emailVerificationExpire:{
        type:Date,
    },
    planType:{
        type:String,
        enum:["FREE","BASIC", "PRO"],
        default:"FREE"
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true
});


userSchema.pre("save", async function (next){
    if(!this.isModified("password") || !this.password) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
   return bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        planType:this.planType,
        name:this.name
    },
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
});
}


userSchema.methods.generateRefreshToken = function (){
      return jwt.sign({
        _id:this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      }
    );
}

const User = mongoose.models.User || mongoose.model("User",userSchema);
export {User};