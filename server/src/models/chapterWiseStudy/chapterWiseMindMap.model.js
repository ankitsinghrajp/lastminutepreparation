import mongoose from "mongoose";

const chapterWiseModelMapSchema = new mongoose.Schema({
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

const ChapterWiseMindMapModel = mongoose.models.ChapterWiseMindMapModel || mongoose.model("ChapterWiseMindMapModel",chapterWiseModelMapSchema);

export {ChapterWiseMindMapModel};