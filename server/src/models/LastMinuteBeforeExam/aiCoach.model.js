import mongoose from "mongoose";

const aiCoachSchema = new mongoose.Schema({
   className:{
    type:String,
    required:true
   },
   subject:{
    type:String,
    required:true,
   },
   chapter:{
    type:String,
    required:true
   },
   content:{
    type:{},
    required:true
   }
},{
    timestamps:true
});

const AiCoach = mongoose.models.AiCoach || mongoose.model("AiCoach",aiCoachSchema);

export {AiCoach};