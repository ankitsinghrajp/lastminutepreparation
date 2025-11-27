import mongoose from "mongoose";

const chapterWiseSummarySchema = new mongoose.Schema({
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
}, {
    timestamps:true
})

const ChapterWiseSummaryModel = mongoose.models.ChapterWiseSummaryModel || mongoose.model("ChapterWiseSummaryModel",chapterWiseSummarySchema);

export {ChapterWiseSummaryModel};