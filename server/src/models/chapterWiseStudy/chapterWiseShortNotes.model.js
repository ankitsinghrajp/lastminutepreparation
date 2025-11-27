import mongoose from "mongoose";

const chapterWiseShortNotesSchema = new mongoose.Schema({
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

const ChapterWiseShortNotesModel = mongoose.models.ChapterWiseShortNotesModel || mongoose.model("ChapterWiseShortNotesModel",chapterWiseShortNotesSchema);

export {ChapterWiseShortNotesModel};