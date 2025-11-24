import mongoose from "mongoose";

const impTopicsSchema = new mongoose.Schema({
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

const ImpTopicsModel = mongoose.models.ImpTopicsModel || mongoose.model("ImpTopicsModel",impTopicsSchema);
export {ImpTopicsModel};