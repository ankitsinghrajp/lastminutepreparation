import mongoose from "mongoose";

const impQuestionSchema = new mongoose.Schema({
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

const ImpQuestionModel = mongoose.models.ImpQuestionModel || mongoose.model("ImpQuestionModel",impQuestionSchema);
export {ImpQuestionModel};