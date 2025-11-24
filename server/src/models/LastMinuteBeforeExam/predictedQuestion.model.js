import mongoose from "mongoose";

const predictedQuestionSchema = new mongoose.Schema({
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

const PredictedQuestionModel = mongoose.models.PredictedQuestionModel || mongoose.model("PredictedQuestionModel",predictedQuestionSchema);
export {PredictedQuestionModel};