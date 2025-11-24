import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
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
})

const LastMinuteSummaryModel =  mongoose.models.LastMinuteSummaryModel || mongoose.model("LastMinuteSummaryModel",summarySchema);

export {LastMinuteSummaryModel}