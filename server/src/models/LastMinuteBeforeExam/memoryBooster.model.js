import mongoose from "mongoose";

const boosterSchema = new mongoose.Schema({
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

const Booster = mongoose.models.Booster || mongoose.model("Booster",boosterSchema);

export {Booster};