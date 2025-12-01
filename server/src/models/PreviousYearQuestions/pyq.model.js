import mongoose from "mongoose";

const pyqSchema = new mongoose.Schema({
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
   year:{
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

const PyqModel = mongoose.models.PyqModel || mongoose.model("PyqModel",pyqSchema);
export {PyqModel};