import { app } from "./app.js";
import { configDotenv } from "dotenv";
import { connectDb } from "./src/db/connectDb.js";
import Razorpay from "razorpay";
configDotenv();
export const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_API_KEY,
   key_secret: process.env.RAZORPAY_KEY_SECRET
})
connectDb()
.then(()=>{
   app.listen(process.env.PORT || 8000,()=>{
    console.log("The server is running on port: ",process.env.PORT);
   })
})
.catch(()=>{
     console.log("Database connection failed!");
})
