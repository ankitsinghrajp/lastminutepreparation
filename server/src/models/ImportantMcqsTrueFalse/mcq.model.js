import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema({
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

const McqModel = mongoose.models.McqModel || mongoose.model("McqModel",mcqSchema);
export {McqModel};