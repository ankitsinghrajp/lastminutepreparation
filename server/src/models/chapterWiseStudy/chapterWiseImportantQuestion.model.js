import mongoose from "mongoose";

const chapterWiseImportantQuestionSchema = new mongoose.Schema({
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

const ChapterWiseImportantQuestionModel = mongoose.models.ChapterWiseImportantQuestionModel || mongoose.model("ChapterWiseImportantQuestionModel",chapterWiseImportantQuestionSchema);

export {ChapterWiseImportantQuestionModel};