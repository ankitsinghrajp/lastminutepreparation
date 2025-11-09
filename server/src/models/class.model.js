import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    chapter:{
        type:String,
        required:true
    },
    index:{
        type:[String],
        default:[]
    }
})
const subjectSchema = new mongoose.Schema({
    subject:{
        type:String,
        required:true
    },
    chapters:{
        type:[chapterSchema],
        default:[]
    }
})
const classSchema = new mongoose.Schema({
     class:{
        type:String,
        required:true
     },
     subjects:{
        type:[subjectSchema],
        default:[]
     }
});

export const ClassModel = mongoose.models.ClassModel || mongoose.model("ClassModel",classSchema);