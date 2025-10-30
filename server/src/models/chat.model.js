import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        default:"New Chat"
    },
    messages:[
        {
            role:{
                type:String,
                enum:["user","ai"],
                required:true
            },
            content:{
                type:String,
                required:true
            },
            timestamps:{
                type:Date,
                default:Date.now
            }
        }
    ]
},
{
     timestamps:true
});

const Chat = mongoose.models.Chat || mongoose.model("Chat",chatSchema);

export {Chat};